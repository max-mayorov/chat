= System design Chat

== Requirements

=== Functional
- Users connect to the System
- Users should authenticate (email and password)
- Users can sign-up
- User have to choose username on sign-up
- Users can change username
- Users can delete own messages
- Store username with the message
- One big chat root
- Add attachments to the messages
- Users should be able to see history of the chat / last 10 min
- Attachments: images / rescale / thumbnails 100KB 

                Users               Messages
Users                           read messages
                                create messages
                                delete messages


Messages    can have a username



Last hour messages count

- 10k users
- 0.1 message per second
- = 1k message per second
- = 580K per 10 mins
- = 10M per hour / writing


- 1/10 
- 1K messages per second
- 100 * 100KB = 10M data per second



== Access patterns

given user, list all messages
given user, create message
given user, delete own message

=== Non functional

- Optimize performance
- Fallback to delay sending of the message with backend unavailable
- Security: DOS protection / rpm restriction on the api => rate limiting
- Availability worldwide: edge caching 
- Consistency: message send/delivered status

== Data Types / API

=== Data Types

- User (email, name, uid)
- Message (uid, text, timestamp, status)
- Attachment (uid, messageid, blobUrl)

=== API

getMessages(offset, limit, userToken) 10k per second
createMessage(text, userToken, attachments)  1 per second
deleteMessage(messageId, userToken) 


== Design

=== Data storage
- Read heavy => Relational Database
  entities
  - User (email, name, uid)
  - Message (uid, userId, text, timestamp, status)
  - Attachment (uid, messageid, blobUrl)

=== Microservices
  
- Query edge: Load balance + Geo, Caching, edge caching // cache latest 1M messages
- Auth
- Live updates / WebSockets api => publish commands to the queue
- Command edge: Event queue 
- Service to process commands: 
  - Validation
    - Validate mime type for the size
    - Request size
  - Upload attachments to the blob -> get the URLs
  - Set the URLs to the message
  - Update in the cache
  - Store to the database
- Queue subscribers: Load balance
- Database: think of the indexes, sharding cold/hot
- Uploading attachments: in sync with a message (only 100K from the client)
- Blob storage
  - 
- Fallback strategy for cache:
  - Monitoring for the Cache service health
  - Automation to restart the cache service when unhealhy
  - Restarting of the cache service should populate it from the database
- 
