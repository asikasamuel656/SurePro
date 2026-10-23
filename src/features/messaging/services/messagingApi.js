import { supabase } from '@/lib/supabase'

/*
 * ---------------------------------------------------------
 * START CONVERSATION
 * ---------------------------------------------------------
 */

export async function startConversation(
  otherUserId,
  jobId = null
) {
  const { data, error } = await supabase.rpc(
    'start_conversation',
    {
      other_user_id: otherUserId,
      p_job_id: jobId,
    }
  )

  if (error) {
    console.error(
      '❌ Could not start conversation:',
      error
    )

    throw error
  }

  return data
}

/*
 * ---------------------------------------------------------
 * FETCH CONVERSATIONS
 * ---------------------------------------------------------
 */

export async function fetchConversations(userId) {
  const {
    data: participantRows,
    error: participantError,
  } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (participantError) {
    throw participantError
  }

  const conversationIds = participantRows.map(
    (row) => row.conversation_id
  )

  if (conversationIds.length === 0) {
    return []
  }

  const {
    data: conversations,
    error: conversationsError,
  } = await supabase
    .from('conversations')
    .select(`
      id,
      job_id,
      updated_at,
      messages (
        id,
        content,
        message_type,
        created_at,
        sender_id
      )
    `)
    .in('id', conversationIds)
    .order('updated_at', {
      ascending: false,
    })

  if (conversationsError) {
    throw conversationsError
  }

  const {
    data: allParticipants,
    error: allParticipantsError,
  } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', conversationIds)

  if (allParticipantsError) {
    throw allParticipantsError
  }

  const otherUserIds = [
    ...new Set(
      allParticipants
        .filter(
          (participant) =>
            participant.user_id !== userId
        )
        .map(
          (participant) =>
            participant.user_id
        )
    ),
  ]

  let profiles = []

  if (otherUserIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        username,
        account_type,
        avatar_url
      `)
      .in('id', otherUserIds)

    if (error) {
      throw error
    }

    profiles = data ?? []
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  )

  const lastReadByConversation = new Map(
    participantRows.map((row) => [
      row.conversation_id,
      row.last_read_at,
    ])
  )

  return conversations.map(
    (conversation) => {
      const otherParticipant =
        allParticipants.find(
          (participant) =>
            participant.conversation_id ===
              conversation.id &&
            participant.user_id !== userId
        )

      const otherUser =
        otherParticipant
          ? profileMap.get(
              otherParticipant.user_id
            )
          : null

      const sortedMessages = [
        ...(conversation.messages ?? []),
      ].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      )

      const lastMessage =
        sortedMessages[0] ?? null

      const lastReadAt =
        lastReadByConversation.get(
          conversation.id
        )

      const unreadCount =
        sortedMessages.filter(
          (message) => {
            if (
              message.sender_id ===
              userId
            ) {
              return false
            }

            if (!lastReadAt) {
              return true
            }

            return (
              new Date(
                message.created_at
              ) >
              new Date(lastReadAt)
            )
          }
        ).length

      return {
        id: conversation.id,
        jobId: conversation.job_id,

        otherUser:
          otherUser ?? {
            id:
              otherParticipant?.user_id,
            full_name:
              'Unknown user',
            account_type: null,
            avatar_url: null,
          },

        otherUserId:
          otherParticipant?.user_id,

        lastMessage,
        unreadCount,
        updatedAt:
          conversation.updated_at,
      }
    }
  )
}

/*
 * ---------------------------------------------------------
 * FETCH SINGLE CONVERSATION IDENTITY
 *
 * This is the ONLY fetchConversation export in this file.
 * ---------------------------------------------------------
 */

export async function fetchConversation(
  conversationId,
  userId
) {
  if (!conversationId || !userId) {
    return null
  }

  /*
   * -------------------------------------------------------
   * 1. Fetch conversation + participants
   *    at the same time
   * -------------------------------------------------------
   */

  const [
    {
      data: conversation,
      error: conversationError,
    },
    {
      data: participants,
      error: participantsError,
    },
  ] = await Promise.all([
    supabase
      .from('conversations')
      .select(`
        id,
        job_id,
        updated_at
      `)
      .eq('id', conversationId)
      .single(),

    supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        last_read_at
      `)
      .eq(
        'conversation_id',
        conversationId
      ),
  ])

  if (conversationError) {
    throw conversationError
  }

  if (participantsError) {
    throw participantsError
  }

  /*
   * -------------------------------------------------------
   * 2. Make sure current user belongs to conversation
   * -------------------------------------------------------
   */

  const isParticipant =
    (participants ?? []).some(
      (participant) =>
        participant.user_id === userId
    )

  if (!isParticipant) {
    throw new Error(
      'You are not a participant in this conversation.'
    )
  }

  /*
   * -------------------------------------------------------
   * 3. Find the other participant
   * -------------------------------------------------------
   */

  const otherParticipant =
    (participants ?? []).find(
      (participant) =>
        participant.user_id !== userId
    )

  if (!otherParticipant) {
    return {
      id: conversation.id,
      jobId: conversation.job_id,
      otherUser: null,
      otherUserId: null,
      otherProfessional: null,
      job: null,
      updatedAt: conversation.updated_at,
    }
  }

  const otherUserId =
    otherParticipant.user_id

  /*
   * -------------------------------------------------------
   * 4. Fetch profile, professional data and job
   *    at the same time
   * -------------------------------------------------------
   */

  const profilePromise =
    supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        avatar_url,
        username,
        account_type
      `)
      .eq('id', otherUserId)
      .single()

  const professionalPromise =
    supabase
      .from('professionals')
      .select(`
        id,
        headline,
        rating,
        completed_jobs,
        is_available,
        category_id
      `)
      .eq('id', otherUserId)
      .maybeSingle()

  const jobPromise = conversation.job_id
    ? supabase
        .from('jobs')
        .select(`
          id,
          title,
          status,
          customer_id,
          accepted_professional_id
        `)
        .eq(
          'id',
          conversation.job_id
        )
        .single()
    : Promise.resolve({
        data: null,
        error: null,
      })

  const [
    {
      data: otherUser,
      error: profileError,
    },
    {
      data: otherProfessional,
      error: professionalError,
    },
    {
      data: job,
      error: jobError,
    },
  ] = await Promise.all([
    profilePromise,
    professionalPromise,
    jobPromise,
  ])

  if (profileError) {
    console.error(
      '❌ Could not fetch other user profile:',
      profileError
    )

    throw profileError
  }

  if (professionalError) {
    throw professionalError
  }

  if (jobError) {
    throw jobError
  }

  /*
   * -------------------------------------------------------
   * 5. Return complete conversation identity
   * -------------------------------------------------------
   */

  return {
    id: conversation.id,
    jobId: conversation.job_id,

    otherUser,
    otherUserId,

    otherProfessional,

    job,

    updatedAt:
      conversation.updated_at,
  }
}

/*
 * ---------------------------------------------------------
 * FETCH MESSAGES
 * ---------------------------------------------------------
 */

export async function fetchMessages(
  conversationId
) {
  const {
    data,
    error,
  } = await supabase
    .from('messages')
    .select('*')
    .eq(
      'conversation_id',
      conversationId
    )
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data ?? []
}

/*
 * ---------------------------------------------------------
 * SEND MESSAGE
 * ---------------------------------------------------------
 */

export async function sendMessage({
  conversationId,
  senderId,
  content,
  messageType = 'text',
  imageUrl,
  metadata,
}) {
  const {
    data,
    error,
  } = await supabase
    .from('messages')
    .insert({
      conversation_id:
        conversationId,

      sender_id:
        senderId,

      content,

      message_type:
        messageType,

      image_url:
        imageUrl,

      metadata:
        metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/*
 * ---------------------------------------------------------
 * MARK CONVERSATION READ
 * ---------------------------------------------------------
 */

export async function markConversationRead(
  conversationId,
  userId
) {
  const {
    error,
  } = await supabase
    .from(
      'conversation_participants'
    )
    .update({
      last_read_at:
        new Date().toISOString(),
    })
    .eq(
      'conversation_id',
      conversationId
    )
    .eq(
      'user_id',
      userId
    )

  if (error) {
    throw error
  }
}

/*
 * ---------------------------------------------------------
 * REALTIME MESSAGES
 * ---------------------------------------------------------
 */

export function subscribeToMessages(
  conversationId,
  onInsert
) {
  const channel =
    supabase
      .channel(
        `messages:${conversationId}`
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter:
            `conversation_id=eq.${conversationId}`,
        },
        (payload) =>
          onInsert(
            payload.new
          )
      )
      .subscribe()

  return () =>
    supabase.removeChannel(
      channel
    )
}