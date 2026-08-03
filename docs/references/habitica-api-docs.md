---
title: "habitica api docs and endpoints"
description: "all habitica apis and endpoints to use on the app"
created: 2026-07-28
url: "<https://apidoc.habitica.com/>"
---

# Habitica api docs and endpoints

- [Habitica api docs and endpoints](#habitica-api-docs-and-endpoints)
  + [Moderators](#moderators)
    - [Moderators | Get the history of a user](#moderators--get-the-history-of-a-user)
      + [Path Parameters](#path-parameters)
      + [Success 200](#success-200)
      + [401](#401)
      + [404](#404)
    - [Moderators | Search for users by username or email](#moderators--search-for-users-by-username-or-email)
      + [Path Parameters](#path-parameters-1)
      + [Success 200](#success-200-1)
      + [401](#401-1)
      + [404](#404-1)
  + [BugReport](#bugreport)
    - [BugReport | Report an issue](#bugreport--report-an-issue)
      + [Body Parameters](#body-parameters)
      + [Success 200](#success-200-2)
      + [400](#400)
      + [404](#404-2)
  + [Challenge](#challenge)
    - [Challenge | Clears flags on a challenge](#challenge--clears-flags-on-a-challenge)
      + [Path Parameters](#path-parameters-2)
      + [Success 200](#success-200-3)
      + [404](#404-3)
    - [Challenge | Clone a challenge](#challenge--clone-a-challenge)
      + [Path Parameters](#path-parameters-3)
      + [Success 200](#success-200-4)
      + [404](#404-4)
    - [Challenge | Create a new challenge](#challenge--create-a-new-challenge)
      + [Body Parameters](#body-parameters-1)
      + [201](#201)
      + [Success 200](#success-200-5)
      + [400](#400-1)
      + [401](#401-2)
      + [404](#404-5)
    - [Challenge | Delete a challenge](#challenge--delete-a-challenge)
      + [Path Parameters](#path-parameters-4)
      + [Success 200](#success-200-6)
      + [404](#404-6)
    - [Challenge | Export a challenge in CSV](#challenge--export-a-challenge-in-csv)
      + [Path Parameters](#path-parameters-5)
      + [Success 200](#success-200-7)
      + [404](#404-7)
    - [Challenge | Flag a challenge](#challenge--flag-a-challenge)
      + [Path Parameters](#path-parameters-6)
      + [Body Parameters](#body-parameters-2)
      + [Success 200](#success-200-8)
      + [404](#404-8)
    - [Challenge | Get a challenge](#challenge--get-a-challenge)
      + [Path Parameters](#path-parameters-7)
      + [Success 200](#success-200-9)
      + [404](#404-9)
    - [Challenge | Get challenges for a group](#challenge--get-challenges-for-a-group)
      + [Path Parameters](#path-parameters-8)
      + [Success 200](#success-200-10)
      + [404](#404-10)
    - [Challenge | Get challenges for a user](#challenge--get-challenges-for-a-user)
      + [Query Parameters](#query-parameters)
      + [Success 200](#success-200-11)
      + [400](#400-2)
      + [404](#404-11)
    - [Challenge | Join a challenge](#challenge--join-a-challenge)
      + [Path Parameters](#path-parameters-9)
      + [Success 200](#success-200-12)
      + [404](#404-12)
    - [Challenge | Leave a challenge](#challenge--leave-a-challenge)
      + [Path Parameters](#path-parameters-10)
      + [Body Parameters](#body-parameters-3)
      + [Success 200](#success-200-13)
      + [404](#404-13)
    - [Challenge | Select winner for challenge](#challenge--select-winner-for-challenge)
      + [Path Parameters](#path-parameters-11)
      + [Success 200](#success-200-14)
      + [404](#404-14)
    - [Challenge | Update a challenge's name, description, or summary](#challenge--update-a-challenges-name-description-or-summary)
      + [Path Parameters](#path-parameters-12)
      + [Body Parameters](#body-parameters-4)
      + [Success 200](#success-200-15)
      + [401](#401-3)
      + [404](#404-15)
  + [Chat](#chat)
    - [Chat | Clear flags](#chat--clear-flags)
      + [Path Parameters](#path-parameters-13)
      + [Success 200](#success-200-16)
      + [400](#400-3)
      + [404](#404-16)
    - [Chat | Delete chat message from a group](#chat--delete-chat-message-from-a-group)
      + [Query Parameters](#query-parameters-1)
      + [Path Parameters](#path-parameters-14)
      + [Success 200](#success-200-17)
      + [400](#400-4)
      + [404](#404-17)
    - [Chat | Flag a group chat message](#chat--flag-a-group-chat-message)
      + [Path Parameters](#path-parameters-15)
      + [Body Parameters](#body-parameters-5)
      + [Success 200](#success-200-18)
      + [400](#400-5)
      + [404](#404-18)
    - [Chat | Get chat messages from a group](#chat--get-chat-messages-from-a-group)
      + [Path Parameters](#path-parameters-16)
      + [Query Parameters](#query-parameters-2)
      + [Success 200](#success-200-19)
      + [400](#400-6)
      + [404](#404-19)
    - [Chat | Like a group chat message](#chat--like-a-group-chat-message)
      + [Path Parameters](#path-parameters-17)
      + [Success 200](#success-200-20)
      + [400](#400-7)
      + [404](#404-20)
    - [Chat | Mark all messages as read for a group](#chat--mark-all-messages-as-read-for-a-group)
      + [Path Parameters](#path-parameters-18)
      + [Success 200](#success-200-21)
      + [400](#400-8)
    - [Chat | Post chat message to a group](#chat--post-chat-message-to-a-group)
      + [Path Parameters](#path-parameters-19)
      + [Body Parameters](#body-parameters-6)
      + [Query Parameters](#query-parameters-3)
      + [400](#400-9)
      + [404](#404-21)
  + [Content](#content)
    - [Content | Get all available content objects](#content--get-all-available-content-objects)
      + [Query Parameters](#query-parameters-4)
      + [Success 200](#success-200-22)
  + [Coupon](#coupon)
    - [Coupon | Generate coupons for an event](#coupon--generate-coupons-for-an-event)
      + [Path Parameters](#path-parameters-20)
      + [Query Parameters](#query-parameters-5)
      + [Success 200](#success-200-23)
      + [400](#400-10)
    - [Coupon | Get coupons](#coupon--get-coupons)
      + [Success 200](#success-200-24)
    - [Coupon | Redeem a coupon code](#coupon--redeem-a-coupon-code)
      + [Path Parameters](#path-parameters-21)
      + [Success 200](#success-200-25)
    - [Coupon | Validate a coupon code](#coupon--validate-a-coupon-code)
      + [Path Parameters](#path-parameters-22)
      + [Success 200](#success-200-26)
  + [Cron](#cron)
    - [Cron | Run cron](#cron--run-cron)
      + [Success 200](#success-200-27)
  + [Data Export](#data-export)
    - [Data Export | Export user data in JSON format](#data-export--export-user-data-in-json-format)
      + [Success 200](#success-200-28)
    - [Data Export | Export user data in XML format](#data-export--export-user-data-in-xml-format)
      + [Success 200](#success-200-29)
    - [Data Export | Export user private messages as HTML document](#data-export--export-user-private-messages-as-html-document)
      + [Success 200](#success-200-30)
    - [Data Export | Export user tasks history in CSV format](#data-export--export-user-tasks-history-in-csv-format)
      + [Success 200](#success-200-31)
  + [Development](#development)
    - [Development | Add Hourglass to the current user](#development--add-hourglass-to-the-current-user)
      + [Success 200](#success-200-32)
    - [Development | Add ten gems to the current user](#development--add-ten-gems-to-the-current-user)
      + [Success 200](#success-200-33)
    - [Development | Artificially accelerate quest progress](#development--artificially-accelerate-quest-progress)
      + [Success 200](#success-200-34)
    - [Development | Artificially trigger boss rage bar](#development--artificially-trigger-boss-rage-bar)
      + [Success 200](#success-200-35)
    - [Development | Manipulate user's inventory](#development--manipulate-users-inventory)
      + [Body Parameters](#body-parameters-7)
      + [Success 200](#success-200-36)
    - [Development | Set lastCron for user](#development--set-lastcron-for-user)
      + [Success 200](#success-200-37)
    - [Development | Sets admin privileges for current user](#development--sets-admin-privileges-for-current-user)
      + [Success 200](#success-200-38)
  + [Group](#group)
    - [Group | Add a manager to a group](#group--add-a-manager-to-a-group)
      + [Path Parameters](#path-parameters-23)
      + [Body Parameters](#body-parameters-8)
      + [Success 200](#success-200-39)
      + [400](#400-11)
    - [Group | Create a Group and then redirect to the correct payment](#group--create-a-group-and-then-redirect-to-the-correct-payment)
      + [201](#201-1)
    - [Group | Create group](#group--create-group)
      + [Body Parameters](#body-parameters-9)
      + [201](#201-2)
      + [401](#401-4)
    - [Group | Get group plans for a user](#group--get-group-plans-for-a-user)
      + [Success 200](#success-200-40)
    - [Group | Get group](#group--get-group)
      + [Path Parameters](#path-parameters-24)
      + [Success 200](#success-200-41)
      + [400](#400-12)
      + [404](#404-22)
    - [Group | Get groups for a user](#group--get-groups-for-a-user)
      + [Query Parameters](#query-parameters-6)
      + [Success 200](#success-200-42)
      + [400](#400-13)
    - [Group | Get users in search of parties](#group--get-users-in-search-of-parties)
      + [Query Parameters](#query-parameters-7)
      + [Success 200](#success-200-43)
      + [400](#400-14)
    - [Group | Invite users to a group](#group--invite-users-to-a-group)
      + [Path Parameters](#path-parameters-25)
      + [Body Parameters](#body-parameters-10)
      + [Success 200](#success-200-44)
      + [400](#400-15)
      + [401](#401-5)
      + [404](#404-23)
    - [Group | Join a group](#group--join-a-group)
      + [Path Parameters](#path-parameters-26)
      + [Success 200](#success-200-45)
      + [400](#400-16)
      + [404](#404-24)
    - [Group | Leave a group](#group--leave-a-group)
      + [Path Parameters](#path-parameters-27)
      + [Query Parameters](#query-parameters-8)
      + [Body Parameters](#body-parameters-11)
      + [Success 200](#success-200-46)
      + [400](#400-17)
      + [404](#404-25)
    - [Group | Reject a group invitation](#group--reject-a-group-invitation)
      + [Path Parameters](#path-parameters-28)
      + [Success 200](#success-200-47)
      + [400](#400-18)
    - [Group | Remove a manager from a group](#group--remove-a-manager-from-a-group)
      + [Path Parameters](#path-parameters-29)
      + [Body Parameters](#body-parameters-12)
      + [Success 200](#success-200-48)
      + [400](#400-19)
    - [Group | Remove a member from a group](#group--remove-a-member-from-a-group)
      + [Path Parameters](#path-parameters-30)
      + [Query Parameters](#query-parameters-9)
      + [Success 200](#success-200-49)
      + [400](#400-20)
      + [401](#401-6)
      + [404](#404-26)
    - [Group | Update group](#group--update-group)
      + [Path Parameters](#path-parameters-31)
      + [Success 200](#success-200-50)
      + [400](#400-21)
      + [404](#404-27)
  + [Hall](#hall)
    - [Hall | Get all Heroes (contributors)](#hall--get-all-heroes-contributors)
      + [Success 200](#success-200-51)
      + [401](#401-7)
    - [Hall | Get all patrons](#hall--get-all-patrons)
      + [Query Parameters](#query-parameters-10)
      + [Success 200](#success-200-52)
      + [401](#401-8)
    - [Hall | Get any Party given its ID](#hall--get-any-party-given-its-id)
      + [Path Parameters](#path-parameters-32)
      + [Success 200](#success-200-53)
      + [400](#400-22)
      + [401](#401-9)
      + [404](#404-28)
    - [Hall | Get any user ("hero") given the UUID or Username](#hall--get-any-user-hero-given-the-uuid-or-username)
      + [Path Parameters](#path-parameters-33)
      + [Success 200](#success-200-54)
      + [401](#401-10)
      + [404](#404-29)
    - [Hall | Get Group Plans for a user](#hall--get-group-plans-for-a-user)
      + [Path Parameters](#path-parameters-34)
      + [Success 200](#success-200-55)
      + [401](#401-11)
      + [404](#404-30)
    - [Hall | Update any user ("hero")](#hall--update-any-user-hero)
      + [Path Parameters](#path-parameters-35)
      + [Success 200](#success-200-56)
      + [401](#401-12)
      + [404](#404-31)
  + [Inbox](#inbox)
    - [Inbox | Get inbox messages for a user](#inbox--get-inbox-messages-for-a-user)
      + [Query Parameters](#query-parameters-11)
      + [Success 200](#success-200-57)
    - [Inbox | Like a private message](#inbox--like-a-private-message)
      + [Path Parameters](#path-parameters-36)
      + [Success 200](#success-200-58)
      + [404](#404-32)
  + [Member](#member)
    - [Member | Delete a user](#member--delete-a-user)
    - [Member | Get a challenge member progress](#member--get-a-challenge-member-progress)
      + [Path Parameters](#path-parameters-37)
      + [Success 200](#success-200-59)
      + [404](#404-33)
    - [Member | Get a member profile](#member--get-a-member-profile)
      + [Path Parameters](#path-parameters-38)
      + [Success 200](#success-200-60)
      + [404](#404-34)
    - [Member | Get invites for a group](#member--get-invites-for-a-group)
      + [Path Parameters](#path-parameters-39)
      + [Query Parameters](#query-parameters-12)
      + [Success 200](#success-200-61)
      + [404](#404-35)
    - [Member | Get member achievements object](#member--get-member-achievements-object)
      + [Path Parameters](#path-parameters-40)
      + [Success 200](#success-200-62)
      + [400](#400-23)
      + [404](#404-36)
    - [Member | Get members for a challenge](#member--get-members-for-a-challenge)
      + [Path Parameters](#path-parameters-41)
      + [Query Parameters](#query-parameters-13)
      + [Success 200](#success-200-63)
      + [404](#404-37)
    - [Member | Get members for a group](#member--get-members-for-a-group)
      + [Path Parameters](#path-parameters-42)
      + [Query Parameters](#query-parameters-14)
      + [Success 200](#success-200-64)
      + [404](#404-38)
    - [Member | Get members purchase history](#member--get-members-purchase-history)
    - [Member | Get objections to interaction](#member--get-objections-to-interaction)
      + [Path Parameters](#path-parameters-43)
      + [Success 200](#success-200-65)
    - [Member | Send a gem gift to a member](#member--send-a-gem-gift-to-a-member)
      + [Body Parameters](#body-parameters-13)
      + [Success 200](#success-200-66)
      + [404](#404-39)
    - [Member | Send a private message to a member](#member--send-a-private-message-to-a-member)
      + [Body Parameters](#body-parameters-14)
      + [Success 200](#success-200-67)
      + [404](#404-40)
  + [Members](#members)
    - [Members | Delete flags from a user](#members--delete-flags-from-a-user)
      + [Path Parameters](#path-parameters-44)
      + [Success 200](#success-200-68)
      + [400](#400-24)
      + [404](#404-41)
    - [Members | Flag (report) a user](#members--flag-report-a-user)
      + [Path Parameters](#path-parameters-45)
      + [Body Parameters](#body-parameters-15)
      + [Success 200](#success-200-69)
      + [400](#400-25)
      + [404](#404-42)
  + [Meta](#meta)
    - [Meta | Get all paths for the specified model](#meta--get-all-paths-for-the-specified-model)
      + [Path Parameters](#path-parameters-46)
      + [Success 200](#success-200-70)
      + [400](#400-26)
  + [News](#news)
    - [News | Allow latest Bailey announcement to be read later](#news--allow-latest-bailey-announcement-to-be-read-later)
      + [Success 200](#success-200-71)
    - [News | Create a new news post](#news--create-a-new-news-post)
      + [Success 200](#success-200-72)
    - [News | Delete a news post](#news--delete-a-news-post)
      + [Path Parameters](#path-parameters-47)
      + [Success 200](#success-200-73)
      + [400](#400-27)
      + [404](#404-43)
    - [News | Get a specific news](#news--get-a-specific-news)
      + [Path Parameters](#path-parameters-48)
      + [Success 200](#success-200-74)
      + [400](#400-28)
      + [404](#404-44)
    - [News | Get latest Bailey announcement](#news--get-latest-bailey-announcement)
      + [Success 200](#success-200-75)
    - [News | Get latest Bailey announcements](#news--get-latest-bailey-announcements)
      + [Query Parameters](#query-parameters-15)
      + [Success 200](#success-200-76)
    - [News | Mark the latest Bailey announcement as read](#news--mark-the-latest-bailey-announcement-as-read)
      + [Success 200](#success-200-77)
    - [News | Update a news post](#news--update-a-news-post)
      + [Path Parameters](#path-parameters-49)
      + [Success 200](#success-200-78)
      + [400](#400-29)
      + [404](#404-45)
  + [Notification](#notification)
    - [Notification | Mark multiple notifications as read](#notification--mark-multiple-notifications-as-read)
      + [Parameter](#parameter)
      + [Success 200](#success-200-79)
    - [Notification | Mark multiple notifications as seen](#notification--mark-multiple-notifications-as-seen)
      + [Parameter](#parameter-1)
      + [Success 200](#success-200-80)
    - [Notification | Mark one notification as read](#notification--mark-one-notification-as-read)
      + [Path Parameters](#path-parameters-50)
      + [Success 200](#success-200-81)
    - [Notification | Mark one notification as seen](#notification--mark-one-notification-as-seen)
      + [Path Parameters](#path-parameters-51)
      + [Success 200](#success-200-82)
  + [Quest](#quest)
    - [Quest | Abort the current quest](#quest--abort-the-current-quest)
      + [Path Parameters](#path-parameters-52)
      + [Success 200](#success-200-83)
      + [404](#404-46)
    - [Quest | Accept a pending quest](#quest--accept-a-pending-quest)
      + [Path Parameters](#path-parameters-53)
      + [Success 200](#success-200-84)
      + [404](#404-47)
    - [Quest | Cancel a quest that is not active](#quest--cancel-a-quest-that-is-not-active)
      + [Path Parameters](#path-parameters-54)
      + [Success 200](#success-200-85)
      + [404](#404-48)
    - [Quest | Force-start a pending quest](#quest--force-start-a-pending-quest)
      + [Path Parameters](#path-parameters-55)
      + [Success 200](#success-200-86)
      + [404](#404-49)
    - [Quest | Invite users to a quest](#quest--invite-users-to-a-quest)
      + [Path Parameters](#path-parameters-56)
      + [Success 200](#success-200-87)
      + [404](#404-50)
    - [Quest | Leave the active quest](#quest--leave-the-active-quest)
      + [Path Parameters](#path-parameters-57)
      + [Success 200](#success-200-88)
      + [404](#404-51)
    - [Quest | Reject a quest](#quest--reject-a-quest)
      + [Path Parameters](#path-parameters-58)
      + [Success 200](#success-200-89)
      + [404](#404-52)
  + [Status](#status)
    - [Status | Get Habitica's API status](#status--get-habiticas-api-status)
      + [Success 200](#success-200-90)
    - [Status | Get Habitica's Server readiness status](#status--get-habiticas-server-readiness-status)
      + [Success 200](#success-200-91)
  + [Tag](#tag)
    - [Tag | Create a new tag](#tag--create-a-new-tag)
      + [Body Parameters](#body-parameters-16)
      + [201](#201-3)
    - [Tag | Delete a user tag](#tag--delete-a-user-tag)
      + [Path Parameters](#path-parameters-59)
      + [Success 200](#success-200-92)
      + [400](#400-30)
      + [404](#404-53)
    - [Tag | Get a tag](#tag--get-a-tag)
      + [Path Parameters](#path-parameters-60)
      + [Success 200](#success-200-93)
      + [400](#400-31)
      + [404](#404-54)
    - [Tag | Get a user's tags](#tag--get-a-users-tags)
      + [Success 200](#success-200-94)
    - [Tag | Reorder a tag](#tag--reorder-a-tag)
      + [Body Parameters](#body-parameters-17)
      + [Success 200](#success-200-95)
      + [404](#404-55)
    - [Tag | Update a tag](#tag--update-a-tag)
      + [Path Parameters](#path-parameters-61)
      + [Body Parameters](#body-parameters-18)
      + [Success 200](#success-200-96)
      + [400](#400-32)
      + [404](#404-56)
  + [Task](#task)
    - [Task | Add a tag to a task](#task--add-a-tag-to-a-task)
      + [Path Parameters](#path-parameters-62)
      + [Success 200](#success-200-97)
      + [400](#400-33)
      + [404](#404-57)
    - [Task | Add an item to the task's checklist](#task--add-an-item-to-the-tasks-checklist)
      + [Path Parameters](#path-parameters-63)
      + [Body Parameters](#body-parameters-19)
      + [Success 200](#success-200-98)
      + [404](#404-58)
    - [Task | Assign a group task to a user or users](#task--assign-a-group-task-to-a-user-or-users)
      + [Path Parameters](#path-parameters-64)
      + [Body Parameters](#body-parameters-20)
      + [Success 200](#success-200-99)
    - [Task | Create a new task belonging to a challenge](#task--create-a-new-task-belonging-to-a-challenge)
      + [Path Parameters](#path-parameters-65)
      + [Body Parameters](#body-parameters-21)
      + [201](#201-4)
      + [400](#400-34)
      + [401](#401-13)
      + [404](#404-59)
    - [Task | Create a new task belonging to a group](#task--create-a-new-task-belonging-to-a-group)
      + [Path Parameters](#path-parameters-66)
      + [Success 200](#success-200-100)
    - [Task | Create a new task belonging to the user](#task--create-a-new-task-belonging-to-the-user)
      + [Body Parameters](#body-parameters-22)
      + [201](#201-5)
      + [400](#400-35)
      + [401](#401-14)
      + [404](#404-60)
    - [Task | Delete a checklist item from a task](#task--delete-a-checklist-item-from-a-task)
      + [Path Parameters](#path-parameters-67)
      + [Success 200](#success-200-101)
      + [404](#404-61)
    - [Task | Delete a tag from a task](#task--delete-a-tag-from-a-task)
      + [Path Parameters](#path-parameters-68)
      + [Success 200](#success-200-102)
      + [404](#404-62)
    - [Task | Delete a task](#task--delete-a-task)
      + [Path Parameters](#path-parameters-69)
      + [Success 200](#success-200-103)
      + [401](#401-15)
      + [404](#404-63)
    - [Task | Delete user's completed todos](#task--delete-users-completed-todos)
      + [Success 200](#success-200-104)
    - [Task | Get a challenge's tasks](#task--get-a-challenges-tasks)
      + [Path Parameters](#path-parameters-70)
      + [Query Parameters](#query-parameters-16)
      + [Success 200](#success-200-105)
      + [404](#404-64)
    - [Task | Get a group's tasks](#task--get-a-groups-tasks)
      + [Path Parameters](#path-parameters-71)
      + [Query Parameters](#query-parameters-17)
      + [Success 200](#success-200-106)
    - [Task | Get a task](#task--get-a-task)
      + [Path Parameters](#path-parameters-72)
      + [Success 200](#success-200-107)
      + [404](#404-65)
    - [Task | Get a user's tasks](#task--get-a-users-tasks)
      + [Query Parameters](#query-parameters-18)
      + [Success 200](#success-200-108)
      + [401](#401-16)
      + [BadRequest](#badrequest)
    - [Task | Move a group task to a specified position](#task--move-a-group-task-to-a-specified-position)
      + [Path Parameters](#path-parameters-73)
      + [Success 200](#success-200-109)
    - [Task | Move a task to a new position](#task--move-a-task-to-a-new-position)
      + [Path Parameters](#path-parameters-74)
      + [Success 200](#success-200-110)
      + [404](#404-66)
    - [Task | Require more work for a group task](#task--require-more-work-for-a-group-task)
      + [Path Parameters](#path-parameters-75)
      + [Success 200](#success-200-111)
    - [Task | Score a checklist item](#task--score-a-checklist-item)
      + [Path Parameters](#path-parameters-76)
      + [Success 200](#success-200-112)
      + [404](#404-67)
    - [Task | Score a task](#task--score-a-task)
      + [Path Parameters](#path-parameters-77)
      + [202](#202)
      + [Success 200](#success-200-113)
      + [404](#404-68)
    - [Task | Unassign a user from a task](#task--unassign-a-user-from-a-task)
      + [Path Parameters](#path-parameters-78)
      + [Success 200](#success-200-114)
    - [Task | Unlink a challenge task](#task--unlink-a-challenge-task)
      + [Path Parameters](#path-parameters-79)
      + [Query Parameters](#query-parameters-19)
      + [Success 200](#success-200-115)
      + [400](#400-36)
      + [404](#404-69)
    - [Task | Unlink all tasks from a challenge](#task--unlink-all-tasks-from-a-challenge)
      + [Path Parameters](#path-parameters-80)
      + [Query Parameters](#query-parameters-20)
      + [Success 200](#success-200-116)
      + [400](#400-37)
    - [Task | Update a checklist item](#task--update-a-checklist-item)
      + [Path Parameters](#path-parameters-81)
      + [Body Parameters](#body-parameters-23)
      + [Success 200](#success-200-117)
      + [404](#404-70)
    - [Task | Update a task](#task--update-a-task)
      + [Path Parameters](#path-parameters-82)
      + [Body Parameters](#body-parameters-24)
      + [Success 200](#success-200-118)
      + [404](#404-71)
  + [Unsubscribe](#unsubscribe)
    - [Unsubscribe | Unsubscribe an email address or user from email notifications](#unsubscribe--unsubscribe-an-email-address-or-user-from-email-notifications)
      + [Query Parameters](#query-parameters-21)
      + [Success 200](#success-200-119)
      + [400](#400-38)
      + [404](#404-72)
    - [Unsubscribe | Unsubscribe an email address or user from email notifications](#unsubscribe--unsubscribe-an-email-address-or-user-from-email-notifications-1)
      + [Query Parameters](#query-parameters-22)
      + [Success 200](#success-200-120)
      + [400](#400-39)
      + [404](#404-73)
  + [User](#user)
    - [User | Allocate a single Stat Point (previously called Attribute Point)](#user--allocate-a-single-stat-point-previously-called-attribute-point)
      + [Query Parameters](#query-parameters-23)
      + [Success 200](#success-200-121)
      + [Error 4xx](#error-4xx)
    - [User | Allocate all Stat Points](#user--allocate-all-stat-points)
      + [Success 200](#success-200-122)
    - [User | Allocate multiple Stat Points](#user--allocate-multiple-stat-points)
      + [Body Parameters](#body-parameters-25)
      + [Success 200](#success-200-123)
      + [Error 4xx](#error-4xx-1)
    - [User | Block / unblock a user from sending you a PM](#user--block--unblock-a-user-from-sending-you-a-pm)
      + [Path Parameters](#path-parameters-83)
      + [Success 200](#success-200-124)
      + [Error 4xx](#error-4xx-2)
    - [User | Buy a health potion](#user--buy-a-health-potion)
      + [Success 200](#success-200-125)
      + [400](#400-40)
    - [User | Buy a Mystery Item set](#user--buy-a-mystery-item-set)
      + [Path Parameters](#path-parameters-84)
      + [Success 200](#success-200-126)
      + [400](#400-41)
    - [User | Buy a piece of gear](#user--buy-a-piece-of-gear)
      + [Path Parameters](#path-parameters-85)
      + [Success 200](#success-200-127)
      + [400](#400-42)
      + [404](#404-74)
    - [User | Buy a quest with gold](#user--buy-a-quest-with-gold)
      + [Path Parameters](#path-parameters-86)
      + [Success 200](#success-200-128)
      + [400](#400-43)
    - [User | Buy an Enchanted Armoire item](#user--buy-an-enchanted-armoire-item)
      + [Success 200](#success-200-129)
      + [400](#400-44)
    - [User | Buy gear, armoire or potion](#user--buy-gear-armoire-or-potion)
      + [Path Parameters](#path-parameters-87)
      + [Success 200](#success-200-130)
      + [400](#400-45)
    - [User | Buy special item (card, avatar transformation)](#user--buy-special-item-card-avatar-transformation)
      + [Path Parameters](#path-parameters-88)
      + [Success 200](#success-200-131)
      + [400](#400-46)
    - [User | Cast a skill (spell) on a target](#user--cast-a-skill-spell-on-a-target)
      + [Path Parameters](#path-parameters-89)
      + [Query Parameters](#query-parameters-24)
      + [Success 200](#success-200-132)
      + [400](#400-47)
      + [404](#404-75)
    - [User | Change class](#user--change-class)
      + [Query Parameters](#query-parameters-25)
      + [Success 200](#success-200-133)
      + [Error 4xx](#error-4xx-3)
    - [User | Check if email is used](#user--check-if-email-is-used)
      + [Body Parameters](#body-parameters-26)
      + [Success 200](#success-200-134)
    - [User | Delete a message](#user--delete-a-message)
      + [Path Parameters](#path-parameters-90)
      + [Success 200](#success-200-135)
    - [User | Delete all messages](#user--delete-all-messages)
      + [Success 200](#success-200-136)
    - [User | Delete an authenticated user's account](#user--delete-an-authenticated-users-account)
      + [Body Parameters](#body-parameters-27)
      + [Success 200](#success-200-137)
      + [Error 4xx](#error-4xx-4)
    - [User | Delete social authentication method](#user--delete-social-authentication-method)
      + [Success 200](#success-200-138)
    - [User | Disable classes](#user--disable-classes)
      + [Success 200](#success-200-139)
    - [User | Equip or unequip an item](#user--equip-or-unequip-an-item)
      + [Path Parameters](#path-parameters-91)
      + [Success 200](#success-200-140)
      + [Error 4xx](#error-4xx-5)
    - [User | Feed a pet](#user--feed-a-pet)
      + [Path Parameters](#path-parameters-92)
      + [Query Parameters](#query-parameters-26)
      + [Success 200](#success-200-141)
      + [Error 4xx](#error-4xx-6)
    - [User | Get anonymized user data](#user--get-anonymized-user-data)
      + [Success 200](#success-200-142)
    - [User | Get equipment/gear items available for purchase for the authenticated user](#user--get-equipmentgear-items-available-for-purchase-for-the-authenticated-user)
    - [User | Get the authenticated user's profile](#user--get-the-authenticated-users-profile)
      + [Query Parameters](#query-parameters-27)
      + [Success 200](#success-200-143)
    - [User | Get the in app items appearing in the user's reward column](#user--get-the-in-app-items-appearing-in-the-users-reward-column)
    - [User | Get users purchase history](#user--get-users-purchase-history)
    - [User | Hatch a pet](#user--hatch-a-pet)
      + [Path Parameters](#path-parameters-93)
      + [Success 200](#success-200-144)
      + [Error 4xx](#error-4xx-7)
    - [User | Login](#user--login)
      + [Body Parameters](#body-parameters-28)
      + [Success 200](#success-200-145)
    - [User | Make the user start / stop sleeping (resting in the Inn)](#user--make-the-user-start--stop-sleeping-resting-in-the-inn)
      + [Success 200](#success-200-146)
    - [User | Mark Private Messages as read](#user--mark-private-messages-as-read)
      + [Success 200](#success-200-147)
    - [User | Move a pinned item in the rewards column to a new position after being sorted](#user--move-a-pinned-item-in-the-rewards-column-to-a-new-position-after-being-sorted)
      + [Path Parameters](#path-parameters-94)
      + [Success 200](#success-200-148)
      + [404](#404-76)
    - [User | Open the Mystery Item box](#user--open-the-mystery-item-box)
      + [Success 200](#success-200-149)
      + [Error 4xx](#error-4xx-8)
    - [User | Purchase Gem or Gem-purchasable item](#user--purchase-gem-or-gem-purchasable-item)
      + [Path Parameters](#path-parameters-95)
      + [Body Parameters](#body-parameters-29)
      + [Success 200](#success-200-150)
      + [Error 4xx](#error-4xx-9)
    - [User | Purchase Hourglass-purchasable item](#user--purchase-hourglass-purchasable-item)
      + [Path Parameters](#path-parameters-96)
      + [Body Parameters](#body-parameters-30)
      + [Success 200](#success-200-151)
      + [Error 4xx](#error-4xx-10)
    - [User | Read a card](#user--read-a-card)
      + [Path Parameters](#path-parameters-97)
      + [Success 200](#success-200-152)
      + [Error 4xx](#error-4xx-11)
    - [User | Register](#user--register)
      + [Body Parameters](#body-parameters-31)
      + [Success 200](#success-200-153)
    - [User | Release mounts](#user--release-mounts)
      + [Success 200](#success-200-154)
      + [Error 4xx](#error-4xx-12)
    - [User | Release pets and mounts and grants Triad Bingo](#user--release-pets-and-mounts-and-grants-triad-bingo)
      + [Success 200](#success-200-155)
      + [Error 4xx](#error-4xx-13)
    - [User | Request a refresh of user stats, including processing of pending level-ups](#user--request-a-refresh-of-user-stats-including-processing-of-pending-level-ups)
      + [Success 200](#success-200-156)
    - [User | Reroll a user (reset tasks) using the Fortify Potion](#user--reroll-a-user-reset-tasks-using-the-fortify-potion)
      + [Success 200](#success-200-157)
      + [Error 4xx](#error-4xx-14)
    - [User | Reset password (email a reset link)](#user--reset-password-email-a-reset-link)
      + [Body Parameters](#body-parameters-32)
      + [Success 200](#success-200-158)
    - [User | Reset password (set a new one)](#user--reset-password-set-a-new-one)
      + [Body Parameters](#body-parameters-33)
      + [Success 200](#success-200-159)
    - [User | Reset user](#user--reset-user)
      + [Success 200](#success-200-160)
    - [User | Revive user from death](#user--revive-user-from-death)
      + [Success 200](#success-200-161)
      + [Error 4xx](#error-4xx-15)
    - [User | Sell a gold-sellable item owned by the user](#user--sell-a-gold-sellable-item-owned-by-the-user)
      + [Path Parameters](#path-parameters-98)
      + [Query Parameters](#query-parameters-28)
      + [Success 200](#success-200-162)
      + [Error 4xx](#error-4xx-16)
    - [User | Set Custom Day Start time for user](#user--set-custom-day-start-time-for-user)
      + [Body Parameters](#body-parameters-34)
      + [Success 200](#success-200-163)
      + [Error 4xx](#error-4xx-17)
    - [User | Toggle an item to be pinned](#user--toggle-an-item-to-be-pinned)
      + [Success 200](#success-200-164)
    - [User | Unequip all items by type](#user--unequip-all-items-by-type)
      + [Path Parameters](#path-parameters-99)
      + [Success 200](#success-200-165)
    - [User | Unlock item or set of items by purchase](#user--unlock-item-or-set-of-items-by-purchase)
      + [Query Parameters](#query-parameters-29)
      + [Success 200](#success-200-166)
      + [Error 4xx](#error-4xx-18)
    - [User | Update email](#user--update-email)
      + [Body Parameters](#body-parameters-35)
      + [Success 200](#success-200-167)
    - [User | Update password](#user--update-password)
      + [Body Parameters](#body-parameters-36)
      + [Success 200](#success-200-168)
    - [User | Update the user](#user--update-the-user)
      + [Success 200](#success-200-169)
      + [401](#401-17)
    - [User | Update username](#user--update-username)
      + [Body Parameters](#body-parameters-37)
      + [Success 200](#success-200-170)
    - [User | Use Orb of Rebirth on user](#user--use-orb-of-rebirth-on-user)
      + [Success 200](#success-200-171)
      + [Error 4xx](#error-4xx-19)
  + [Webhook](#webhook)
    - [Webhook | Create a new webhook - BETA](#webhook--create-a-new-webhook---beta)
      + [Body Parameters](#body-parameters-38)
      + [201](#201-6)
      + [400](#400-48)
    - [Webhook | Delete a webhook - BETA](#webhook--delete-a-webhook---beta)
      + [Path Parameters](#path-parameters-100)
      + [Success 200](#success-200-172)
      + [404](#404-77)
    - [Webhook | Edit a webhook - BETA](#webhook--edit-a-webhook---beta)
      + [Path Parameters](#path-parameters-101)
      + [Body Parameters](#body-parameters-39)
      + [Success 200](#success-200-173)
      + [400](#400-49)
      + [404](#404-78)
    - [Webhook | Get webhooks](#webhook--get-webhooks)
      + [Success 200](#success-200-174)
  + [WorldState](#worldstate)
    - [WorldState | Get the state for the game world](#worldstate--get-the-state-for-the-game-world)
      + [Success 200](#success-200-175)
  + [i18n](#i18n)
    - [i18n | Returns the i18n js script](#i18n--returns-the-i18n-js-script)
    - [i18n | Returns the i18n js script](#i18n--returns-the-i18n-js-script-1)

## Moderators

Contributors of tier 8 or higher can use this route.

### Moderators | Get the history of a user

Returns the history of a user

```http get-method
https://habitica.com/api/v4/admin/user/:userId/history
```

Permission: Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| userIdentifier | String | The username or email of the user |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The User history |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |
| NotAdmin | NotAuthorized | User is not an admin |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NoUser | NotFound | The specified user could not be found. |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Admin-GetUserHistory-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Admin-GetUserHistory-0_0_0-1)
- [No user](https://apidoc.habitica.com/#error-examples-Admin-GetUserHistory-0_0_0-2)
- [No admin access](https://apidoc.habitica.com/#error-examples-Admin-GetUserHistory-0_0_0-3)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have admin access."
}
```

### Moderators | Search for users by username or email

Returns a list of users that match the search criteria

```http get-method
https://habitica.com/api/v4/admin/search/:userIdentifier
```

Permission: Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| userIdentifier | String | The username or email of the user to search for |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The User list |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |
| NotAdmin | NotAuthorized | User is not an admin |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NoUser | NotFound | The specified user could not be found. |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Admin-SearchUsers-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Admin-SearchUsers-0_0_0-1)
- [No user](https://apidoc.habitica.com/#error-examples-Admin-SearchUsers-0_0_0-2)
- [No admin access](https://apidoc.habitica.com/#error-examples-Admin-SearchUsers-0_0_0-3)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have admin access."
}
```

## BugReport

### BugReport | Report an issue

This POST method is used to send bug reports from the Website. Since it needs the Users Data, it requires authentication.

```http post-method
https://habitica.com/api/v4/bug-report
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| message | String | Bug Report Message to sent |
| email | String | User Email |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Result of this bug report |
| ok  | Boolean | Status of this report |
| message | String | Status of this report |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| emptyReportBugMessage | BadRequest | The report message is missing. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

## Challenge

### Challenge | Clears flags on a challenge

```http post-method
https://habitica.com/api/v3/challenges/:challengeId/clearflags
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The \_id for the challenge to clear flags from |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The flagged challenge message |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Clone a challenge

```http post-method
https://habitica.com/api/v3/challenges/:challengeId/clone
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The \_id for the challenge to clone |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| challenge | Object | The cloned challenge |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Create a new challenge

Creates a challenge. Cannot create associated tasks with this route. See [CreateChallengeTasks](https://apidoc.habitica.com/#api-Task-CreateChallengeTasks).

```http post-method
https://habitica.com/api/v3/challenges
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| challenge | Object | An object representing the challenge to be created |
| group | UUID | The id of the group to which the challenge belongs |
| name | String | The full name of the challenge |
| shortName | String | A shortened name for the challenge, to be used as a tag. |
| summary optional | String | A short summary advertising the main purpose of the challenge; maximum 250 characters; if not supplied, challenge.name will be used. |
| description optional | String | A detailed description of the challenge |
| official optional | Boolean | Whether or not a challenge is an official Habitica challenge (requires admin).<br><br>Default value: `false` |
| prize optional | Number | Number of gems offered as a prize to challenge winner.<br><br>Default value: `0` |

#### 201

| Field | Type | Description |
| --- | --- | --- |
| challenge | Object | The newly created challenge. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| challenge.group.\_id | UUID | The group id. |
| challenge.group.type | String | Group type: `guild` or `party`. |
| challenge.group.privacy | String | Group privacy: `public` or `private`. |
| challenge.name | String | Full name of challenge. |
| challenge.shortName | String | A shortened name for the challenge, to be used as a tag. |
| challenge.leader | Object | User details of challenge leader. |
| \_id | UUID | User ID of challenge leader. |
| profile | Object | Profile information of leader. |
| name | Object | Display Name of leader. |
| challenge.updatedAt | String | Timestamp of last update. |
| challenge.createdAt | String | Timestamp of challenge creation. |
| challenge.id | UUID | Id number of newly created challenge. |
| challenge.\_id | UUID | Same as `challenge.id`. |
| challenge.prize | String | Number of gems offered as prize to winner (can be 0). |
| challenge.memberCount | String | Number users participating in challenge. |
| challenge.tasksOrder | Object | Object containing IDs of the challenge's tasks and rewards in their preferred sort order. |
| rewards | Array | Array of `reward` task IDs. |
| todos | Array | Array of `todo` task IDs. |
| dailys | Array | Array of `daily` task IDs. |
| habits | Array | Array of `habit` task IDs. |
| challenge.official | Boolean | Boolean indicating if this is an official Habitica challenge. |

- [Successful response with single challenge](https://apidoc.habitica.com/#success-examples-Challenge-CreateChallenge-0_0_0-0)

```json
{
  "data": {
    "group": {
     "_id": "group-id-associated-with-challenge",
     "name": "MyGroup",
     "type": "guild",
     "privacy": "public"
    },
    "name": "Long Detailed Name of Challenge",
    "shortName": "my challenge",
    "leader": {
      "_id": "user-id-of-challenge-creator",
      "profile": {
        "name": "MyUserName"
      }
    },
    "updatedAt": "timestamp",
    "createdAt": "timestamp",
    "_id": "challenge-id",
    "prize": 0,
    "memberCount": 1,
    "tasksOrder": {
      "rewards": [
        "uuid-of-challenge-reward"
      ],
      "todos": [
        "uuid-of-challenge-todo"
      ],
      "dailys": [
        "uuid-of-challenge-daily"
      ],
      "habits": [
        "uuid-of-challenge-habit"
      ]
    },
    "official": false,
    "id": "challenge-id"
  }
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| ChallengeValidationFailed | BadRequest | Invalid or missing parameter in challenge body. |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| CantAffordPrize | NotAuthorized | User does not have enough gems to offer this prize. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| UserNotFound | NotFound | The specified user could not be found. |

### Challenge | Delete a challenge

```http delete-method
https://habitica.com/api/v3/challenges/:challengeId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The \_id for the challenge to delete |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Export a challenge in CSV

```http get-method
https://habitica.com/api/v3/challenges/:challengeId/export/csv
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| challenge | String | A csv file |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Flag a challenge

```http post-method
https://habitica.com/api/v3/challenges/:challengeId/flag
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The \_id for the challenge to flag |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| comment optional | String | Why the message was flagged |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The flagged challenge message |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Get a challenge

```http get-method
https://habitica.com/api/v3/challenges/:challengeId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The challenge object |
| challenge.group.\_id | UUID | The group id. |
| challenge.group.type | String | Group type: `guild` or `party`. |
| challenge.group.privacy | String | Group privacy: `public` or `private`. |
| challenge.name | String | Full name of challenge. |
| challenge.shortName | String | A shortened name for the challenge, to be used as a tag. |
| challenge.leader | Object | User details of challenge leader. |
| \_id | UUID | User ID of challenge leader. |
| profile | Object | Profile information of leader. |
| name | Object | Display Name of leader. |
| challenge.updatedAt | String | Timestamp of last update. |
| challenge.createdAt | String | Timestamp of challenge creation. |
| challenge.id | UUID | Id number of newly created challenge. |
| challenge.\_id | UUID | Same as `challenge.id`. |
| challenge.prize | String | Number of gems offered as prize to winner (can be 0). |
| challenge.memberCount | String | Number users participating in challenge. |
| challenge.tasksOrder | Object | Object containing IDs of the challenge's tasks and rewards in their preferred sort order. |
| rewards | Array | Array of `reward` task IDs. |
| todos | Array | Array of `todo` task IDs. |
| dailys | Array | Array of `daily` task IDs. |
| habits | Array | Array of `habit` task IDs. |
| challenge.official | Boolean | Boolean indicating if this is an official Habitica challenge. |

- [Successful response with single challenge](https://apidoc.habitica.com/#success-examples-Challenge-GetChallenge-0_0_0-0)

```json
{
  "data": {
    "group": {
     "_id": "group-id-associated-with-challenge",
     "name": "MyGroup",
     "type": "guild",
     "privacy": "public"
    },
    "name": "Long Detailed Name of Challenge",
    "shortName": "my challenge",
    "leader": {
      "_id": "user-id-of-challenge-creator",
      "profile": {
        "name": "MyUserName"
      }
    },
    "updatedAt": "timestamp",
    "createdAt": "timestamp",
    "_id": "challenge-id",
    "prize": 0,
    "memberCount": 1,
    "tasksOrder": {
      "rewards": [
        "uuid-of-challenge-reward"
      ],
      "todos": [
        "uuid-of-challenge-todo"
      ],
      "dailys": [
        "uuid-of-challenge-daily"
      ],
      "habits": [
        "uuid-of-challenge-habit"
      ]
    },
    "official": false,
    "id": "challenge-id"
  }
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Get challenges for a group

Get challenges hosted in the specified group.

```http get-method
https://habitica.com/api/v3/challenges/groups/:groupId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group id ('party' for the user party and 'habitrpg' for tavern are accepted) |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of challenges sorted with official challenges first, followed by the challenges in order from newest to oldest. |
| challenge.group.\_id | UUID | The group id. |
| challenge.group.type | String | Group type: `guild` or `party`. |
| challenge.group.privacy | String | Group privacy: `public` or `private`. |
| challenge.name | String | Full name of challenge. |
| challenge.shortName | String | A shortened name for the challenge, to be used as a tag. |
| challenge.leader | Object | User details of challenge leader. |
| \_id | UUID | User ID of challenge leader. |
| profile | Object | Profile information of leader. |
| name | Object | Display Name of leader. |
| challenge.updatedAt | String | Timestamp of last update. |
| challenge.createdAt | String | Timestamp of challenge creation. |
| challenge.id | UUID | Id number of newly created challenge. |
| challenge.\_id | UUID | Same as `challenge.id`. |
| challenge.prize | String | Number of gems offered as prize to winner (can be 0). |
| challenge.memberCount | String | Number users participating in challenge. |
| challenge.tasksOrder | Object | Object containing IDs of the challenge's tasks and rewards in their preferred sort order. |
| rewards | Array | Array of `reward` task IDs. |
| todos | Array | Array of `todo` task IDs. |
| dailys | Array | Array of `daily` task IDs. |
| habits | Array | Array of `habit` task IDs. |
| challenge.official | Boolean | Boolean indicating if this is an official Habitica challenge. |

- [Successful response with array of challenges](https://apidoc.habitica.com/#success-examples-Challenge-GetGroupChallenges-0_0_0-0)

```json
{
  "data": [{
    "group": {
      "_id": "group-id-associated-with-challenge",
      "name": "MyGroup",
      "type": "guild",
      "privacy": "public"
    },
    "name": "Long Detailed Name of Challenge",
    "shortName": "my challenge",
    "leader": {
      "_id": "user-id-of-challenge-creator",
      "profile": {
        "name": "MyUserName"
      }
    },
    "updatedAt": "timestamp",
    "createdAt": "timestamp",
    "_id": "challenge-id",
    "prize": 0,
    "memberCount": 1,
    "tasksOrder": {
      "rewards": [
        "uuid-of-challenge-reward"
      ],
      "todos": [
        "uuid-of-challenge-todo"
      ],
      "dailys": [
        "uuid-of-challenge-daily"
      ],
      "habits": [
        "uuid-of-challenge-habit"
      ]
    },
    "official": false,
    "id": "challenge-id"
  }]
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |
| GroupNotFound | NotFound | The specified group could not be found. |

### Challenge | Get challenges for a user

Get challenges the user has access to. Includes public challenges, challenges belonging to the user's group, and challenges the user has already joined. Returns 10 results per page.

```http get-method
https://habitica.com/api/v3/challenges/user
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| page | Number | This parameter can be used to specify the page number for the user challenges result (the initial page is number 0). |
| member optional | String | If set to `true` it limits results to challenges where the user is a member, or the user owns the challenge. |
| owned optional | String | If set to `owned` it limits results to challenges owned by the user. If set to `not_owned` it limits results to challenges not owned by the user. |
| search optional | String | Optional query parameter to filter results to challenges that include (even partially) the search query parameter in the name or description. |
| categories optional | String | Optional comma separated list of categories. If set it limits results to challenges that are part of the given categories. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| challenges | Object\[\] | An array of challenges sorted with official challenges first, followed by the challenges in order from newest to oldest. |
| challenge.group.\_id | UUID | The group id. |
| challenge.group.type | String | Group type: `guild` or `party`. |
| challenge.group.privacy | String | Group privacy: `public` or `private`. |
| challenge.name | String | Full name of challenge. |
| challenge.shortName | String | A shortened name for the challenge, to be used as a tag. |
| challenge.leader | Object | User details of challenge leader. |
| \_id | UUID | User ID of challenge leader. |
| profile | Object | Profile information of leader. |
| name | Object | Display Name of leader. |
| challenge.updatedAt | String | Timestamp of last update. |
| challenge.createdAt | String | Timestamp of challenge creation. |
| challenge.id | UUID | Id number of newly created challenge. |
| challenge.\_id | UUID | Same as `challenge.id`. |
| challenge.prize | String | Number of gems offered as prize to winner (can be 0). |
| challenge.memberCount | String | Number users participating in challenge. |
| challenge.tasksOrder | Object | Object containing IDs of the challenge's tasks and rewards in their preferred sort order. |
| rewards | Array | Array of `reward` task IDs. |
| todos | Array | Array of `todo` task IDs. |
| dailys | Array | Array of `daily` task IDs. |
| habits | Array | Array of `habit` task IDs. |
| challenge.official | Boolean | Boolean indicating if this is an official Habitica challenge. |

- [Successful response with array of challenges](https://apidoc.habitica.com/#success-examples-Challenge-GetUserChallenges-0_0_0-0)

```json
{
  "data": [{
    "group": {
      "_id": "group-id-associated-with-challenge",
      "name": "MyGroup",
      "type": "guild",
      "privacy": "public"
    },
    "name": "Long Detailed Name of Challenge",
    "shortName": "my challenge",
    "leader": {
      "_id": "user-id-of-challenge-creator",
      "profile": {
        "name": "MyUserName"
      }
    },
    "updatedAt": "timestamp",
    "createdAt": "timestamp",
    "_id": "challenge-id",
    "prize": 0,
    "memberCount": 1,
    "tasksOrder": {
      "rewards": [
        "uuid-of-challenge-reward"
      ],
      "todos": [
        "uuid-of-challenge-todo"
      ],
      "dailys": [
        "uuid-of-challenge-daily"
      ],
      "habits": [
        "uuid-of-challenge-habit"
      ]
    },
    "official": false,
    "id": "challenge-id"
  }]
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| queryPageInteger | BadRequest | Page query parameter must be a positive integer |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

### Challenge | Join a challenge

```http post-method
https://habitica.com/api/v3/challenges/:challengeId/join
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| challenge | Object | The challenge the user joined |
| challenge.group.\_id | UUID | The group id. |
| challenge.group.type | String | Group type: `guild` or `party`. |
| challenge.group.privacy | String | Group privacy: `public` or `private`. |
| challenge.name | String | Full name of challenge. |
| challenge.shortName | String | A shortened name for the challenge, to be used as a tag. |
| challenge.leader | Object | User details of challenge leader. |
| \_id | UUID | User ID of challenge leader. |
| profile | Object | Profile information of leader. |
| name | Object | Display Name of leader. |
| challenge.updatedAt | String | Timestamp of last update. |
| challenge.createdAt | String | Timestamp of challenge creation. |
| challenge.id | UUID | Id number of newly created challenge. |
| challenge.\_id | UUID | Same as `challenge.id`. |
| challenge.prize | String | Number of gems offered as prize to winner (can be 0). |
| challenge.memberCount | String | Number users participating in challenge. |
| challenge.tasksOrder | Object | Object containing IDs of the challenge's tasks and rewards in their preferred sort order. |
| rewards | Array | Array of `reward` task IDs. |
| todos | Array | Array of `todo` task IDs. |
| dailys | Array | Array of `daily` task IDs. |
| habits | Array | Array of `habit` task IDs. |
| challenge.official | Boolean | Boolean indicating if this is an official Habitica challenge. |

- [Successful response with single challenge](https://apidoc.habitica.com/#success-examples-Challenge-JoinChallenge-0_0_0-0)

```json
{
  "data": {
    "group": {
     "_id": "group-id-associated-with-challenge",
     "name": "MyGroup",
     "type": "guild",
     "privacy": "public"
    },
    "name": "Long Detailed Name of Challenge",
    "shortName": "my challenge",
    "leader": {
      "_id": "user-id-of-challenge-creator",
      "profile": {
        "name": "MyUserName"
      }
    },
    "updatedAt": "timestamp",
    "createdAt": "timestamp",
    "_id": "challenge-id",
    "prize": 0,
    "memberCount": 1,
    "tasksOrder": {
      "rewards": [
        "uuid-of-challenge-reward"
      ],
      "todos": [
        "uuid-of-challenge-todo"
      ],
      "dailys": [
        "uuid-of-challenge-daily"
      ],
      "habits": [
        "uuid-of-challenge-habit"
      ]
    },
    "official": false,
    "id": "challenge-id"
  }
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| UserNotFound | NotFound | The specified user could not be found. |

### Challenge | Leave a challenge

```http post-method
https://habitica.com/api/v3/challenges/:challengeId/leave
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| keep optional | String | Whether or not to keep or remove the challenge's tasks.<br><br>Default value: `keep-all`<br><br>Allowed values: `"remove-all"`, `"keep-all"` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| UserNotFound | NotFound | The specified user could not be found. |

### Challenge | Select winner for challenge

```http post-method
https://habitica.com/api/v3/challenges/:challengeId/selectWinner/:winnerId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The \_id for the challenge to close with a winner |
| winnerId | UUID | The \_id of the winning user |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Challenge | Update a challenge's name, description, or summary

```http put-method
https://habitica.com/api/v3/challenges/:challengeId
```

Permission: ChallengeLeader

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| name optional | String | The new full name of the challenge. |
| summary optional | String | The new challenge summary. |
| description optional | String | The new challenge description. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated challenge |

- [Successful response with single challenge](https://apidoc.habitica.com/#success-examples-Challenge-UpdateChallenge-0_0_0-0)

```json
{
  "data": {
    "group": {
     "_id": "group-id-associated-with-challenge",
     "name": "MyGroup",
     "type": "guild",
     "privacy": "public"
    },
    "name": "Long Detailed Name of Challenge",
    "shortName": "my challenge",
    "leader": {
      "_id": "user-id-of-challenge-creator",
      "profile": {
        "name": "MyUserName"
      }
    },
    "updatedAt": "timestamp",
    "createdAt": "timestamp",
    "_id": "challenge-id",
    "prize": 0,
    "memberCount": 1,
    "tasksOrder": {
      "rewards": [
        "uuid-of-challenge-reward"
      ],
      "todos": [
        "uuid-of-challenge-todo"
      ],
      "dailys": [
        "uuid-of-challenge-daily"
      ],
      "habits": [
        "uuid-of-challenge-habit"
      ]
    },
    "official": false,
    "id": "challenge-id"
  }
}
```

#### 401

| Name | Type | Description |
| --- | --- | --- |
| MustBeChallengeLeader | NotAuthorized | Only challenge leader can update the challenge. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

## Chat

### Chat | Clear flags

Resets the flag count on a chat message. Retains the id of the user's that have flagged the message. (Only visible to moderators)

```http post-method
https://habitica.com/api/v3/groups/:groupId/chat/:chatId/clearflags
```

Permission: Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group id ('party' for the user party and 'habitrpg' for tavern are accepted) |
| chatId | UUID | The chat message id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | badRequest | A group ID is required |
| chatIdRequired | badRequest | A chat ID is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| MustBeAdmin | NotAuthorized | Must be a moderator to use this route |
| GroupNotFound | NotFound | The specified group could not be found. |
| MessageNotFound | NotFound | The specified message could not be found. |

### Chat | Delete chat message from a group

Delete's a chat message from a group

```http delete-method
https://habitica.com/api/v3/groups/:groupId/chat/:chatId
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| previousMsg | UUID | The last message's ID fetched by the client so that the whole chat will be returned only if new messages have been posted in the meantime. |

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |
| chatId | UUID | The chat message id |

#### Success 200

| Field | Description |
| --- | --- |
| data | The updated chat array or an empty object if no message was posted after previousMsg. |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| onlyCreatorOrAdminCanDeleteChat |     | Only the creator of the message and admins can delete a chat message. |
| groupIdRequired | badRequest | A group ID is required |
| chatIdRequired | badRequest | A chat ID is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| MessageNotFound | NotFound | The specified message could not be found. |

### Chat | Flag a group chat message

A message will be hidden from chat if two or more users flag a message. It will be hidden immediately if a moderator flags the message. An email is sent to the moderators about every flagged message.

```http post-method
https://habitica.com/api/v3/groups/:groupId/chat/:chatId/flag
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group id ('party' for the user party and 'habitrpg' for tavern are accepted) |
| chatId | UUID | The chat message id |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| comment optional | String | explain why the message was flagged |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The flagged chat message |
| id  | UUID | The id of the message |
| text | String | The text of the message |
| timestamp | Number | The timestamp of the message in milliseconds |
| likes | Object | The likes of the message |
| flags | Object | The flags of the message |
| flagCount | Number | The number of flags the message has |
| uuid | UUID | The User ID of the author of the message |
| user | String | The username of the author of the message |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | badRequest | A group ID is required |
| chatIdRequired | badRequest | A chat ID is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| AlreadyFlagged | NotFound | Chat messages cannot be flagged more than once by a user |
| messageGroupChatFlagAlreadyReported | NotFound | The message has already been flagged. |
| GroupNotFound | NotFound | The specified group could not be found. |
| MessageNotFound | NotFound | The specified message could not be found. |

### Chat | Get chat messages from a group

Fetches an array of messages from a group

```http get-method
https://habitica.com/api/v3/groups/:groupId/chat
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| limit optional | Number | The number of messages to fetch (max 400).<br><br>Default value: `50` |
| before optional | String | Fetch messages older than this message ID. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of [chat messages](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js#L51) |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | badRequest | A group ID is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |

### Chat | Like a group chat message

Likes a chat message from a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/chat/:chatId/like
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |
| chatId | UUID | The chat message \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The liked [chat message](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js#L51) |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | badRequest | A group ID is required |
| chatIdRequired | badRequest | A chat ID is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| MessageNotFound | NotFound | The specified message could not be found. |

### Chat | Mark all messages as read for a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/chat/seen
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted) |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | badRequest | A group ID is required |

### Chat | Post chat message to a group

Posts a chat message to a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/chat
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted) |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| message | String | Message The message to post |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| previousMsg | UUID | The previous chat message's UUID which will force a return of the full group chat. |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| chatPriviledgesRevoked | NotAuthorized | You cannot do that because your chat privileges have been revoked. |
| groupIdRequired | badRequest | A group ID is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |

## Content

### Content | Get all available content objects

Does not require authentication.

```http get-method
https://habitica.com/api/v3/content
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| language optional | String | Language code used for the items' strings. If the authenticated user makes the request, the content will return with the user's configured language.<br><br>Default value: `en`<br><br>Allowed values: `"bg"`, `"cs"`, `"da"`, `"de"`, `"en"`, `"en@pirate"`, `"en_GB"`, `"es"`, `"es_419"`, `"fr"`, `"he"`, `"hu"`, `"id"`, `"it"`, `"ja"`, `"nl"`, `"pl"`, `"pt"`, `"pt_BR"`, `"ro"`, `"ru"`, `"sk"`, `"sr"`, `"sv"`, `"uk"`, `"zh"`, `"zh_TW"` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Various data about the content of Habitica. The content route contains many keys, but the data listed below are the recommended data to use. |
| mystery | Object | The mystery sets awarded to paying subscribers. |
| gear | Object | The gear that can be equipped. |
| tree | Object | Detailed information about the gear, organized by type. |
| flat | Object | The full key of each equipment. |
| spells | Object | The skills organized by class. Includes cards and visual buffs. |
| potion | Object | Data about the health potion. |
| armoire | Object | Data about the armoire. |
| classes | Array | The available classes. |
| eggs | Object | All available eggs. |
| timeTravelStable | Object | The animals available in the Time Traveler's stable, separated into pets and mounts. |
| hatchingPotions | Object | All the hatching potions. |
| petInfo | Object | All the pets with extra info. |
| mountInfo | Object | All the mounts with extra info. |
| food | Object | All the food. |
| userCanOwnQuestCategories | Array | The types of quests that a user can own. |
| quests | Object | Data about the quests. |
| appearances | Object | Data about the appearance properties. |
| hair | Object | Data about available hair options. |
| shirt | Object | Data about available shirt options. |
| size | Object | Data about available body size options. |
| skin | Object | Data about available skin options. |
| chair | Object | Data about available chair options. |
| background | Object | Data about available background options. |
| backgrounds | Object | Data about the background sets. |
| subscriptionBlocks | Object | Data about the various subscriptions blocks. |

## Coupon

### Coupon | Generate coupons for an event

```http post-method
https://habitica.com/api/v3/coupons/generate/:event
```

Permission: sudo

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| event | String | The event for which the coupon should be generated<br><br>Allowed values: `wondercon`, `google_6mo` |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| count | Number | The number of coupon codes to generate |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | Generated coupons |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| CouponValidationError | BadRequest | The request was missing the count query parameter or used an invalid event. |

### Coupon | Get coupons

```http get-method
https://habitica.com/api/v3/coupons
```

Permission: sudo

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| Coupons | String | in CSV format |

- [Example success:](https://apidoc.habitica.com/#success-examples-Coupon-GetCoupons-0_0_0-0)

```string
code,event,date,user
GJG4-WEA4-QX3P,wondercon,1476929528704,user-uuid
TT32-EYQA-JPBT,wondercon,1476929528705,
V3EK-GE8M-LMJ4,wondercon,1476929528705,another-user-uuid
```

### Coupon | Redeem a coupon code

```http post-method
https://habitica.com/api/v3/coupons/enter/:code
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| code | String | The coupon code to apply |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | User object |

### Coupon | Validate a coupon code

```http post-method
https://habitica.com/api/v3/coupons/validate/:code
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| code | String | The coupon code to validate |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| valid | Boolean | True or False |

## Cron

### Cron | Run cron

This causes cron to run. It assumes that the user has already been shown the Record Yesterday's Activity ("Check off any Dailies you did yesterday") screen and so it will immediately apply damage for incomplete due Dailies.

```http post-method
https://habitica.com/api/v3/cron
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

## Data Export

These routes allow you to download backups of your data.

**Note:** They are intended to be used on the website only and as such are part of the private API and may change at any time.

### Data Export | Export user data in JSON format

```http get-method
https://habitica.com/export/userdata.json
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| File | JSON | A JSON file of the user object and tasks. |

### Data Export | Export user data in XML format

This XML export feature is not currently working (<https://github.com/HabitRPG/habitica/issues/10100>).

```http get-method
https://habitica.com/export/userdata.xml
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| File | XML | An xml file of the user object. |

### Data Export | Export user private messages as HTML document

```http get-method
https://habitica.com/export/inbox.html
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| File | HTML | An html page of the user's private messages. |

### Data Export | Export user tasks history in CSV format

History is only available for habits and dailies so todos and rewards won't be included. Can only be used on <https://habitica.com>.

```http get-method
https://habitica.com/export/history.csv
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| File | CSV | A csv file of your task history. |

- [history.csv](https://apidoc.habitica.com/#success-examples-DataExport-ExportUserHistory-0_0_0-0)

```csv
Task Name,Task ID,Task Type,Date,Value
Be Awesome,e826ddfa-dc2e-445f-a06c-64d3881982ea,habit,2016-06-02 13:26:05,1
Be Awesome,e826ddfa-dc2e-445f-a06c-64d3881982ea,habit,2016-06-03 05:06:55,1.026657310999762
...
```

## Development

These routes only exist while Habitica is in development mode. (Such as running a local instance on your computer).

### Development | Add Hourglass to the current user

```http post-method
https://habitica.com/api/v3/debug/add-hourglass
```

Permission: Developers

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### Development | Add ten gems to the current user

```http post-method
https://habitica.com/api/v3/debug/add-ten-gems
```

Permission: Developers

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### Development | Artificially accelerate quest progress

```http post-method
https://habitica.com/api/v3/debug/quest-progress
```

Permission: Developers

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### Development | Artificially trigger boss rage bar

```http post-method
https://habitica.com/api/v3/debug/boss-rage
```

Permission: Developers

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### Development | Manipulate user's inventory

```http post-method
https://habitica.com/api/v3/debug/modify-inventory
```

Permission: Developers

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| gear | Object | Object to replace user's `[gear.owned](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#L243)` object. |
| special | Object | Object to replace user's `[special](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#272)` object. |
| pets | Object | Object to replace user's `[pets](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#296)` object. |
| mounts | Object | Object to replace user's `[mounts](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#329)` object. |
| eggs | Object | Object to replace user's `[eggs](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#310)` object. |
| hatchingPotions | Object | Object to replace user's `[hatchingPotions](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#316)` object. |
| food | Object | Object to replace user's `[food](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#322)` object. |
| quests | Object | Object to replace user's `[quests](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/user/schema.js#344)` object. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### Development | Set lastCron for user

```http post-method
https://habitica.com/api/v3/debug/set-cron
```

Permission: Developers

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### Development | Sets admin privileges for current user

```http post-method
https://habitica.com/api/v3/debug/make-admin
```

Permission: Developers

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

## Group

### Group | Add a manager to a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/add-manager
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| managerId | UUID | The user \_id of the member to promote to manager |

- [party:](https://apidoc.habitica.com/#parameter-examples-Group-AddGroupManager-0_0_0-0)

```string
/api/v3/groups/party/add-manager
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| managerId | NotAuthorized | req.body.managerId is required |
| groupIdRequired | BadRequest | A groupId is required |

### Group | Create a Group and then redirect to the correct payment

```http post-method
https://habitica.com/api/v3/groups/create-plan
```

#### 201

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The created group |

### Group | Create group

```http post-method
https://habitica.com/api/v3/groups
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| name | String |     |
| type | String | Type of group (guild or party)<br><br>Allowed values: `"guild"`, `"party"` |
| privacy | String | Privacy of group (party MUST be private)<br><br>Allowed values: `"private"`, `"public"` |

- [Private Guild:](https://apidoc.habitica.com/#parameter-examples-Group-CreateGroup-0_0_0-0)

```json
{
    "name": "The Best Guild",
    "type": "guild",
    "privacy": "private"
}
```

#### 201

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The created group (See [/website/server/models/group.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js)) |

- [Private Guild:](https://apidoc.habitica.com/#success-examples-Group-CreateGroup-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "name": "The Best Guild",
  "leader": {
    "_id": "authenticated-user-id",
    "profile": {authenticated user's profile}
  },
  "type": "guild",
  "privacy": "private",
  "chat": [],
  "leaderOnly": {
    "challenges": false
  },
  memberCount: 1,
  challengeCount: 0,
  balance: 1,
  logo: "",
  leaderMessage: ""
}
```

#### 401

| Name | Type | Description |
| --- | --- | --- |
| messageInsufficientGems | NotAuthorized | User does not have enough gems (4) |
| partyMustbePrivate | NotAuthorized | Party must have privacy set to private |
| messageGroupAlreadyInParty | NotAuthorized |     |

### Group | Get group plans for a user

```http get-method
https://habitica.com/api/v3/group-plans
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object\[\] | An array of the requested groups with a group plan (See [/website/server/models/group.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js)) |

- [Groups the user is in with a group plan:](https://apidoc.habitica.com/#success-examples-Group-GetGroupPlans-0_0_0-0)

```json
HTTP/1.1 200 OK
[
  {groupPlans}
]
```

### Group | Get group

```http get-method
https://habitica.com/api/v3/groups/:groupId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted) |

- [Tavern:](https://apidoc.habitica.com/#parameter-examples-Group-GetGroup-0_0_0-0)

```string
/api/v3/groups/habitrpg
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The group object (See [/website/server/models/group.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js)) |

- [Tavern:](https://apidoc.habitica.com/#success-examples-Group-GetGroup-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "name": "Tavern",
  ...
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | BadRequest | A groupId is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |

### Group | Get groups for a user

```http get-method
https://habitica.com/api/v3/groups
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| type | String | The type of groups to retrieve. Must be a query string representing a list of values like 'tavern,party'. Possible values are party, guilds, privateGuilds, publicGuilds, tavern. |
| paginate optional | String | Public guilds support pagination. When true guilds are returned in groups of 30.<br><br>Allowed values: `"true"`, `"false"` |
| page optional | Number | When pagination is enabled for public guilds this parameter can be used to specify the page number (the initial page is number 0 and not required). |

- [Private Guilds, Tavern:](https://apidoc.habitica.com/#parameter-examples-Group-GetGroups-0_0_0-0)

```json
{
    "type": "privateGuilds,tavern"
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object\[\] | An array of the requested groups (See [/website/server/models/group.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js)) |

- [Private Guilds, Tavern:](https://apidoc.habitica.com/#success-examples-Group-GetGroups-0_0_0-0)

```json
HTTP/1.1 200 OK
[
  {guilds}
]
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupTypesRequired | BadRequest | Group types are required |
| guildsPaginateBooleanString | BadRequest | Paginate query parameter must be a boolean (true or false). |
| queryPageInteger | BadRequest | Page query parameter must be a positive integer |
| guildsOnlyPaginate | BadRequest | Only public guilds support pagination |

### Group | Get users in search of parties

```http get-method
https://habitica.com/api/v3/looking-for-party
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| page optional | Number | Page number, defaults to 0 |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object\[\] | An array of users looking for a party |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| notPartyLeader | BadRequest | You are not the leader of a Party. |

### Group | Invite users to a group

You can provide both `emails` and `uuids`, or just one. You must provide at least one.

```http post-method
https://habitica.com/api/v3/groups/:groupId/invite
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted) |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| emails optional | Object\[\] | An array of objects, each representing one email address to invite. |
| email | String | The email address of the user being invited. |
| name optional | String | The name of the user being invited. |
| uuids optional | Array | An array of uuids to invite |

- [Emails](https://apidoc.habitica.com/#parameter-examples-Group-InviteToGroup-0_0_0-0)
- [User IDs](https://apidoc.habitica.com/#parameter-examples-Group-InviteToGroup-0_0_0-1)
- [User IDs and Emails](https://apidoc.habitica.com/#parameter-examples-Group-InviteToGroup-0_0_0-2)

```json
{
    "emails": [
        {
            "email": "user-1@example.com"
        },
        {
            "name": "User2",
            "email": "user-2@example.com"
        }
    ]
}
```

```json
{
    "uuids": [
        "user-id-of-existing-user",
        "user-id-of-another-existing-user"
    ]
}
```

```json
{
    "emails": [
        {
            "email": "user-1@example.com"
        },
        {
            "email": "user-2@example.com"
        }
    ],
    "uuids": [
        "user-id-of-existing-user"
    ]
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | The invites |

- [Successful Response with Emails](https://apidoc.habitica.com/#success-examples-Group-InviteToGroup-0_0_0-0)
- [Successful Response with User ID](https://apidoc.habitica.com/#success-examples-Group-InviteToGroup-0_0_0-1)
- [Successful Response with User IDs and Emails](https://apidoc.habitica.com/#success-examples-Group-InviteToGroup-0_0_0-2)

```json
{
    "data": [
        "user-1@example.com",
        "user-2@exmaple.com"
    ]
}
```

```json
{
  "data": [
    { id: 'the-id-of-the-invited-user', name: 'The group name', inviter: 'your-user-id' }
  ]
}
```

```json
{
  "data": [
    "user-1@example.com",
    { id: 'the-id-of-the-invited-user', name: 'The group name', inviter: 'your-user-id' },
    "user-2@exmaple.com"
  ]
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| NoEmailProvided | BadRequest | An email address was not provided in the `emails` body param `Array`. |
| UuidOrEmailOnly | BadRequest | The `emails` and `uuids` params were both missing and/or a. key other than `emails` or `uuids` was provided in the body param. |
| CannotInviteSelf | BadRequest | User ID or email of invitee matches that of the inviter. |
| MustBeArray | BadRequest | The `uuids` or `emails` body param was not an array. |
| TooManyInvites | BadRequest | A max of 100 invites (combined emails and User IDs) can be sent out at a time. |
| ExceedsMembersLimit | BadRequest | A max of 30 members can join a party. |
| GroupBodyInvalid | BadRequest | A parameter in the group body was invalid. |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| UserAlreadyInvited | NotAuthorized | The user has already been invited to the group. |
| UserAlreadyInGroup | NotAuthorized | The user is already a member of the group. |
| CannotInviteWhenMuted | NotAuthorized | You cannot invite anyone to a guild or party because your chat privileges have been revoked. |
| NotAuthorizedToSendMessageToThisUser | NotAuthorized | You can't send a message to this player because they have chosen to block messages. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| UserNotFound | NotFound | The specified user could not be found. |
| PartyNotFound | NotFound | The user's party could not be found. |

### Group | Join a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/join
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

- [Tavern:](https://apidoc.habitica.com/#parameter-examples-Group-JoinGroup-0_0_0-0)

```string
/api/v3/groups/habitrpg/join
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The joined group (See [/website/server/models/group.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js)) |

- [Tavern:](https://apidoc.habitica.com/#success-examples-Group-JoinGroup-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "name": "Tavern",
  ...
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | BadRequest | A groupId is required |
| messageGroupRequiresInvite | NotAuthorized | Group requires an invitation to join (e.g. private group, party). |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |

### Group | Leave a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/leave
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| keep | String | Whether or not to keep challenge tasks belonging to the group being left.<br><br>Default value: `keep-all`<br><br>Allowed values: `"remove-all"`, `"keep-all"` |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| keepChallenges optional | String | Whether or not to remain in the challenges of the group being left.<br><br>Default value: `leave-challenges`<br><br>Allowed values: `"remain-in-challenges"`, `"leave-challenges"` |

- [Leave Party:](https://apidoc.habitica.com/#parameter-examples-Group-LeaveGroup-0_0_0-0)

```json
/api/v3/groups/party/leave
{
  "keepChallenges": "remain-in-challenges"
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| keepOrRemoveAll | BadRequest | "keep" parameter is not "remove-all" or "keep-all" |
| questLeaderCannotLeaveGroup | NotAuthorized | User could not leave party because they are the owner of a quest currently running. |
| cannotLeaveWhileActiveQuest | NotAuthorized | User could not leave party due to being in a quest. |
| groupIdRequired | BadRequest | A groupId is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |

### Group | Reject a group invitation

```http post-method
https://habitica.com/api/v3/groups/:groupId/reject-invite
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

- [party:](https://apidoc.habitica.com/#parameter-examples-Group-RejectGroupInvite-0_0_0-0)

```string
/api/v3/groups/party/reject-invite
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | BadRequest | A groupId is required |
| messageGroupRequiresInvite | NotAuthorized | Group requires an invitation to join (e.g. private group, party). |

### Group | Remove a manager from a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/remove-manager
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| managerId | UUID | The user \_id of the member to remove |

- [party:](https://apidoc.habitica.com/#parameter-examples-Group-RemoveGroupManager-0_0_0-0)

```string
/api/v3/groups/party/add-manager
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| group | Object | The group |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| managerId | NotAuthorized | req.body.managerId is required |
| groupIdRequired | BadRequest | A groupId is required |

### Group | Remove a member from a group

```http post-method
https://habitica.com/api/v3/groups/:groupId/removeMember/:memberId
```

Permission: GroupLeader, Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |
| memberId | UUID | The \_id of the member to remove |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| message | String | Query parameter - The message to send to the removed members |

- [Remove member from party:](https://apidoc.habitica.com/#parameter-examples-Group-RemoveGroupMember-0_0_0-0)

```url
/api/v3/groups/party/removeMember/[User's ID]?message=Bye
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| userIdrequired | BadRequest | "memberId" cannot be empty or not a UUID |
| groupIdRequired | BadRequest | A groupId is required |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| onlyLeaderCanRemoveMember | NotAuthorized | Only the group leader can remove members. |
| memberCannotRemoveYourself | NotAuthorized | Group leader cannot remove themselves |
| cannotRemoveQuestOwner | NotAuthorized | Group leader cannot remove the owner of an active quest |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| groupMemberNotFound | NotFound | Group member was not found |
| GroupNotFound | NotFound | The specified group could not be found. |

### Group | Update group

```http put-method
https://habitica.com/api/v3/groups/:groupId
```

Permission: GroupLeader, Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id ('party' for the user party and 'habitrpg' for tavern are accepted). |

- [Tavern:](https://apidoc.habitica.com/#parameter-examples-Group-UpdateGroup-0_0_0-0)

```string
/api/v3/groups/habitrpg
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated group (See [/website/server/models/group.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/group.js)) |

- [Tavern:](https://apidoc.habitica.com/#success-examples-Group-UpdateGroup-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "name": "Tavern",
  ...
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| messageGroupOnlyLeaderCanUpdate | NotAuthorized | Only the group's leader can update the party. |
| groupIdRequired | BadRequest | A groupId is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |

## Hall

### Hall | Get all Heroes (contributors)

Returns an array of objects containing the heroes who have contributed for Habitica. The array is sorted by the contribution level in descending order.

```http get-method
https://habitica.com/api/v3/hall/heroes
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| heroes | Array | An array of heroes |

- [Example response:](https://apidoc.habitica.com/#success-examples-Hall-GetHeroes-0_0_0-0)

```json
{
    "success": true,
    "data": [
        {
            "_id": "e6e01d2a-c2fa-4b9f-9c0f-7865b777e7b5",
            "profile": {
                "name": "test2"
            },
            "contributor": {
                "admin": false,
                "level": 2,
                "text": "Linguist"
            },
            "backer": {}
        }
    ]
}
```

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Hall-GetHeroes-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Hall-GetHeroes-0_0_0-1)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

### Hall | Get all patrons

Returns an array of objects containing the patrons who backed Habitica's original kickstarter. The array is sorted by the backer tier in descending order. By default, only the first 50 patrons are returned. More can be accessed by passing ?page=n

```http get-method
https://habitica.com/api/v3/hall/patrons
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| page optional | Number | The result page.<br><br>Default value: `0` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of patrons |

- [Example response](https://apidoc.habitica.com/#success-examples-Hall-GetPatrons-0_0_0-0)

```json
{
    "success": true,
    "data": [
        {
            "_id": "3adb52a9-0dfb-4752-81f2-a62d911d1bf5",
            "profile": {
                "name": "mattboch"
            },
            "contributor": {},
            "backer": {
                "tier": 800,
                "npc": "Beast Master"
            }
        },
        {
            "_id": "9da65443-ed43-4c21-804f-d260c1361596",
            "profile": {
                "name": "ʎǝlᴉɐq s,┴I"
            },
            "contributor": {
                "text": "Pollen Purveyor",
                "admin": true,
                "level": 8
            },
            "backer": {
                "npc": "Town Crier",
                "tier": 800,
                "tokensApplied": true
            }
        }
    ]
}
```

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Hall-GetPatrons-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Hall-GetPatrons-0_0_0-1)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

### Hall | Get any Party given its ID

Returns some basic information about a given Party, to assist admins with user support.

```http get-method
https://habitica.com/api/v3/hall/heroes/party/:groupId
```

Permission: userSupport

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | party's group ID |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The party object (contains computed fields that are not in the Group model) |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| groupIdRequired | BadRequest | A groupId is required |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |
| NoPrivs | NotAuthorized | User does not have the required admin privileges. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NoUser | NotFound | The specified user could not be found. |
| GroupNotFound | NotFound | The specified group could not be found. |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Hall-GetHeroParty-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Hall-GetHeroParty-0_0_0-1)
- [No user](https://apidoc.habitica.com/#error-examples-Hall-GetHeroParty-0_0_0-2)
- [User does not have the required privileges.](https://apidoc.habitica.com/#error-examples-Hall-GetHeroParty-0_0_0-3)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have the required privileges."
}
```

### Hall | Get any user ("hero") given the UUID or Username

Returns various data about the user. User does not need to be a contributor.

```http get-method
https://habitica.com/api/v3/hall/heroes/:heroId
```

Permission: Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| heroId | UUID | user ID |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The user object |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |
| NotAdmin | NotAuthorized | User is not an admin |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NoUser | NotFound | The specified user could not be found. |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Hall-GetHero-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Hall-GetHero-0_0_0-1)
- [No user](https://apidoc.habitica.com/#error-examples-Hall-GetHero-0_0_0-2)
- [No admin access](https://apidoc.habitica.com/#error-examples-Hall-GetHero-0_0_0-3)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have admin access."
}
```

### Hall | Get Group Plans for a user

Returns some basic information about group plans, to assist admins with user support.

```http get-method
https://habitica.com/api/v3/hall/heroes/:heroId
```

Permission: userSupport

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | party's group ID |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The active group plans |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |
| NoPrivs | NotAuthorized | User does not have the required admin privileges. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NoUser | NotFound | The specified user could not be found. |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Hall-GetHeroGroupPlans-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Hall-GetHeroGroupPlans-0_0_0-1)
- [No user](https://apidoc.habitica.com/#error-examples-Hall-GetHeroGroupPlans-0_0_0-2)
- [User does not have the required privileges.](https://apidoc.habitica.com/#error-examples-Hall-GetHeroGroupPlans-0_0_0-3)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have the required privileges."
}
```

### Hall | Update any user ("hero")

Update various details in the user's User document, including but not limited to privileges, gems, contributions, items.

```http put-method
https://habitica.com/api/v3/hall/heroes/:heroId
```

Permission: Admin

- [Example Body:](https://apidoc.habitica.com/#examples-Hall-UpdateHero-0_0_0-0)

```json
{
   "balance": 1000,
   "auth": {"blocked": false},
   "flags": {
     "chatRevoked": true,
     "chatShadowMuted": true
   },
   "purchased": {"ads": true},
   "contributor": {
     "admin": true,
     "newsPoster": false,
     "contributions": "Improving API documentation",
     "level": 5,
     "text": "Scribe, Blacksmith"
   },
   "secret": {
     "text": "child with permission to use site",
   },
   "itemPath": "items.pets.BearCub-Skeleton",
   "itemVal": 5,
   "changeApiToken": true,
}
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| heroId | UUID | User ID |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated user object |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAuthHeaders | NotAuthorized | Missing authentication headers |
| NoAccount | NotAuthorized | There is no account that uses those credentials |
| NotAdmin | NotAuthorized | User is not an admin |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NoUser | NotFound | The specified user could not be found. |

- [Missing authentication headers](https://apidoc.habitica.com/#error-examples-Hall-UpdateHero-0_0_0-0)
- [No account](https://apidoc.habitica.com/#error-examples-Hall-UpdateHero-0_0_0-1)
- [No user](https://apidoc.habitica.com/#error-examples-Hall-UpdateHero-0_0_0-2)
- [No admin access](https://apidoc.habitica.com/#error-examples-Hall-UpdateHero-0_0_0-3)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Missing authentication headers."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "There is no account that uses those credentials."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "User with id \"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have admin access."
}
```

## Inbox

### Inbox | Get inbox messages for a user

Get inbox messages for a user

```http get-method
https://habitica.com/api/v3/inbox/messages
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| page | Number | Load the messages of the selected Page - 10 Messages per Page |
| conversation | GUID | Loads only the messages of a conversation |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of inbox messages |

### Inbox | Like a private message

Likes a private message, this uses the uniqueMessageId which is a shared ID between message copies of both chat participants

```http post-method
https://habitica.com/api/v4//inbox/like-private-message/:uniqueMessageId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| uniqueMessageId | UUID | This is NOT private message.id, but rather message.uniqueMessageId |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The liked [private message](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/message.js#L42) |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| MessageNotFound | NotFound | The specified message could not be found. |

## Member

### Member | Delete a user

```http delete-method
https://habitica.com/api/v4/members/:memberId
```

### Member | Get a challenge member progress

```http get-method
https://habitica.com/api/v3/challenges/:challengeId/members/:memberId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |
| memberId | UUID | The member \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Return an object with member \_id, profile.name and a tasks object with the challenge tasks for the member. |

- [Success-Response:](https://apidoc.habitica.com/#success-examples-Member-GetChallengeMemberProgress-0_0_0-0)

```json
{
  "data": {
    "_id": "b0413351-405f-416f-8787-947ec1c85199",
    "profile": {"name": "MadPink"},
    "tasks": [
      {
        "_id": "9cd37426-0604-48c3-a950-894a6e72c156",
      "text": "Make sure the place where you sleep is quiet, dark, and cool.",
        "updatedAt": "2017-06-17T17:44:15.916Z",
        "createdAt": "2017-06-17T17:44:15.916Z",
        "reminders": [],
        "group": {
          "approval": {
            "requested": false,
            "approved": false,
            "required": false
          },
          "assignedUsers": []
        },
        "challenge": {
          "taskId": "6d3758b1-071b-4bfa-acd6-755147a7b5f6",
          "id": "4db6bd82-b829-4bf2-bad2-535c14424a3d",
          "shortName": "Take This June 2017"
        },
        "attribute": "str",
        "priority": 1,
        "value": 0,
        "notes": "",
        "type": "todo",
        "checklist": [],
        "collapseChecklist": false,
        "completed": false,
      },
        "startDate": "2016-09-01T05:00:00.000Z",
        "everyX": 1,
        "frequency": "weekly",
        "id": "b207a15e-8bfd-4aa7-9e64-1ba89699da06"
      }
    ]
  }
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| UserNotFound | NotFound | The specified user could not be found. |

### Member | Get a member profile

```http get-method
https://habitica.com/api/v3/members/:memberId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| memberId | UUID | The member's id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The member object |
| inbox | Object | Basic information about person's inbox |
| stats | Object | Includes current stats and buffs |
| profile | Object | Includes name |
| preferences | Object | Includes info about appearance and public prefs |
| party | Object | Includes basic info about current party and quests |
| items | Object | Basic inventory information includes quests, food, potions, eggs, gear, special items |
| achievements | Object | Lists current achievements |
| auth | Object | Includes latest timestamps |

- [Success-Response:](https://apidoc.habitica.com/#success-examples-Member-GetMember-0_0_0-0)

```json
{
 "success": true,
 "data": {
   "_id": "99999999-9999-9999-9999-8f14c101aeff",
   "inbox": {
     "optOut": false
   },
   "stats": {
   ---INCLUDES STATS AND BUFFS---
   },
   "profile": {
     "name": "Ezra"
   },
   "preferences": {
     ---INCLUDES INFO ABOUT APPEARANCE AND PUBLIC PREFS---
   },
   "party": {
     "_id": "12345678-0987-abcd-82a6-837c81db4c1e",
     "quest": {
       "RSVPNeeded": false,
       "progress": {}
     },
   },
   "items": {
     "lastDrop": {
       "count": 0,
       "date": "2017-01-15T02:41:35.009Z"
     },
       ----INCLUDES QUESTS, FOOD, POTIONS, EGGS, GEAR, CARDS, SPECIAL ITEMS (E.G. SNOWBALLS)----
     }
   },
   "achievements": {
     "partyUp": true,
     "habitBirthdays": 2,
   },
   "auth": {
     "timestamps": {
       "loggedin": "2017-03-05T12:30:54.545Z",
       "created": "2017-01-12T03:30:11.842Z"
     }
   },
   "id": "99999999-9999-9999-9999-8f14c101aeff"
 }
}
)
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

### Member | Get invites for a group

With a limit of 30 member per request (by default). To get all invites run requests against this routes (updating the lastId query parameter) until you get less than 30 results.

```http get-method
https://habitica.com/api/v3/groups/:groupId/invites
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group id ('party' for the user party is accepted) |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| lastId | UUID | Query parameter to specify the last invite returned in a previous request to this route and get the next batch of results. |
| limit | Number | BETA Query parameter to specify the number of results to return. Max is 60.<br><br>Default value: `30` |
| includeAllPublicFields | Boolean | If set to `true` then all public fields for members will be returned (similar to when making a request for a single member). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | array | An array of invites, sorted by \_id |

- [Success-Response:](https://apidoc.habitica.com/#success-examples-Member-GetInvitesForGroup-0_0_0-0)

```json
{
    "success": true,
    "data": [
        {
            "_id": "99f3cb9d-4af8-4ca4-9b82-6b2a6bf59b7a",
            "profile": {
                "name": "DoomSmoocher"
            },
            "id": "99f3cb9d-4af8-4ca4-9b82-6b2a6bf59b7a"
        }
    ]
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| GroupNotFound | NotFound | The specified group could not be found. |

### Member | Get member achievements object

Get a list of achievements of the requested member, grouped by basic / seasonal / special.

```http get-method
https://habitica.com/api/v3/members/:memberId/achievements
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| memberId | UUID | The member's id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The achievements object |
| basic | Object | The basic achievements object |
| seasonal | Object | The seasonal achievements object |
| special | Object | The special achievements object |
| label | String | The label for that category |
| achievements | Object | The achievements in that category |
| title | String | The localized title string |
| text | String | The localized description string |
| earned | Boolean | Whether the user has earned the achievement |
| index | Number | The unique index assigned to the achievement (only for sorting purposes). |
| value | Anything | The value related to the achievement (if applicable) |
| optionalCount | Number | The count related to the achievement (if applicable) |

- [Successful Response](https://apidoc.habitica.com/#success-examples-Member-GetMemberAchievements-0_0_0-0)

```json
{
  basic: {
    label: "Basic",
    achievements: {
      streak: {
        title: "0 Streak Achievements",
        text: "Has performed 0 21-day streaks on Dailies",
        icon: "achievement-thermometer",
        earned: false,
        value: 0,
        index: 60,
        optionalCount: 0
      },
      perfect: {
        title: "5 Perfect Days",
        text: "Completed all active Dailies on 5 days. With this achievement
               you get a +level/2 buff to all attributes for the next day.
               Levels greater than 100 don't have any additional effects on buffs.",
        icon: "achievement-perfect",
        earned: true,
        value: 5,
        index: 61,
        optionalCount: 5
      }
    }
  },
  seasonal: {
    label: "Seasonal",
    achievements: {
      habiticaDays: {
        title: "Habitica Naming Day",
        text: "Celebrated 0 Naming Days! Thanks for being a fantastic user.",
        icon: "achievement-habiticaDay",
        earned: false,
        value: 0,
        index: 72,
        optionalCount: 0
      }
    }
  },
  special: {
    label: "Special",
    achievements: {
      habitSurveys: {
        title: "Helped Habitica Grow",
        text: "Helped Habitica grow on 0 occasions, either by filling out
              a survey or helping with a major testing effort. Thank you!",
        icon: "achievement-tree",
        earned: false,
        value: 0,
        index: 88,
        optionalCount: 0
      }
    }
  }
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| MemberIdRequired | BadRequest | The `id` param is required and must be a valid `UUID`. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserWithIdNotFound | NotFound | The `id` param did not belong to an existing member. |

### Member | Get members for a challenge

With a limit of 30 member per request (by default). To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results. BETA You can also use ?includeAllMembers=true. This option is currently in BETA and may be removed in future. Its use is discouraged and its performances are not optimized especially for large challenges.

```http get-method
https://habitica.com/api/v3/challenges/:challengeId/members
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge id |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| lastId | UUID | Query parameter to specify the last member returned in a previous request to this route and get the next batch of results. |
| limit | Number | BETA Query parameter to specify the number of results to return. Max is 60.<br><br>Default value: `30` |
| includeTasks | Boolean | BETA Query parameter - If 'true' then include challenge tasks of each member |
| includeAllPublicFields | Boolean | If set to `true` then all public fields for members will be returned (similar to when making a request for a single member). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of members, sorted by \_id |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| GroupNotFound | NotFound | The specified group could not be found. |

### Member | Get members for a group

With a limit of 30 member per request (by default). To get all members run requests against this routes (updating the lastId query parameter) until you get less than 30 results (or the specified limit).

```http get-method
https://habitica.com/api/v3/groups/:groupId/members
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The group id ('party' for the user party is accepted) |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| lastId | UUID | Query parameter to specify the last member returned in a previous request to this route and get the next batch of results. |
| limit | Number | BETA Query parameter to specify the number of results to return. Max is 60.<br><br>Default value: `30` |
| includeAllPublicFields | Boolean | If set to `true` then all public fields for members will be returned (similar to when making a request for a single member). |
| includeTasks | Boolean | If set to `true`, then response should include all tasks per user related to the challenge |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of members, sorted by \_id |

- [Success-Response:](https://apidoc.habitica.com/#success-examples-Member-GetMembersForGroup-0_0_0-0)

```json
{
  "success": true,
  "data": [
    {
      "_id": "00000001-1111-9999-9000-111111111111",
      "profile": {
        "name": "Jiminy"
      },
      "id": "00000001-1111-9999-9000-111111111111"
    },
 }
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| GroupNotFound | NotFound | The specified group could not be found. |

### Member | Get members purchase history

```http get-method
https://habitica.com/api/v4/members/:memberId/purchase-history
```

### Member | Get objections to interaction

Get any objections that would occur if the given interaction was attempted - BETA.

```http get-method
https://habitica.com/api/v3/members/:toUserId/objections/:interaction
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| toUserId | UUID | The user to interact with |
| interaction | String | Name of the interaction to query.<br><br>Allowed values: `"send-private-message"`, `"transfer-gems"` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | Return an array of objections, if the interaction would be blocked; otherwise an empty array. |

### Member | Send a gem gift to a member

```http post-method
https://habitica.com/api/v3/members/transfer-gems
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| message | String | The message to the user |
| toUserId | UUID | The user to send the gift to |
| gemAmount | Integer | The number of gems to send |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

### Member | Send a private message to a member

```http post-method
https://habitica.com/api/v3/members/send-private-message
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| message | String | The message |
| toUserId | UUID | The id of the user to contact |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| message | Object | The message just sent |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

## Members

### Members | Delete flags from a user

Removes any abuse reports flagged on a user profile.

```http post-method
https://habitica.com/api/v3/members/:memberId/clear-flags
```

Permission: Admin

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| memberId | UUID | The unique ID of the flagged user to reset |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| MemberIdRequired | BadRequest | The `memberId` param is required and must be a valid `UUID`. |
| MustBeAdmin | BadRequest | Must be a moderator to use this route |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserWithIdNotFound | NotFound | The `memberId` param did not belong to an existing user. |

### Members | Flag (report) a user

Sends an email to staff about another user or their profile

```http post-method
https://habitica.com/api/v3/members/:memberId/flag
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| memberId | UUID | The unique ID of the user being flagged |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| comment optional | String | explain why the user was flagged |
| source optional | String | URL or view from which the user was flagged |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The flagged user |
| id  | UUID | The id of the flagged user |
| username | String | The username of the flagged user |
| profile | Object | The flagged user's profile information |
| blurb | String | Text of the flagged user's profile bio |
| flags | Object | Data about flags the profile has received. Restricted to the reporting user's own flag unless the reporting user is a moderator. Each key is a UUID, and fields are comment, source, and timestamp. |
| imageUrl | String | URL of the flagged user's profile image |
| name | String | The flagged user's display name |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| AlreadyFlagged | BadRequest | A profile cannot be flagged more than once by the same user. |
| MemberIdRequired | BadRequest | The `memberId` param is required and must be a valid `UUID`. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserWithIdNotFound | NotFound | The `memberId` param did not belong to an existing user. |

## Meta

### Meta | Get all paths for the specified model

Doesn't require authentication

```http get-method
https://habitica.com/api/v3/models/:model/paths
```

- [Tag](https://apidoc.habitica.com/#examples-Meta-GetUserModelPaths-0_0_0-0)

```curl
curl https://habitica.com/api/v3/models/tag/paths
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| model | String | The name of the model<br><br>Allowed values: `"user"`, `"group"`, `"challenge"`, `"tag"`, `"habit"`, `"daily"`, `"todo"`, `"reward"` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | A key-value object made of fieldPath: fieldType (like {'field.nested': Boolean}) |

- [Tag](https://apidoc.habitica.com/#success-examples-Meta-GetUserModelPaths-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "id": "String",
        "name": "String",
        "challenge": "String"
    }
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| modelNotFound | badRequest | The model specified was not found |

## News

### News | Allow latest Bailey announcement to be read later

Add a notification to allow viewing of the latest "New Stuff by Bailey" message. Prevent this specific Bailey message from appearing automatically.

```http post-method
https://habitica.com/api/v3/news/tell-me-later
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### News | Create a new news post

```http post-method
https://habitica.com/api/v4/news
```

Permission: NewsPoster

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The created news post (See [/website/server/models/newsPost.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js)) |

- [Post:](https://apidoc.habitica.com/#success-examples-News-CreateNewsPost-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "title": "News Title",
  ...
}
```

### News | Delete a news post

```http delete-method
https://habitica.com/api/v4/news/:postId
```

Permission: NewsPoster

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| postId | String | The posts \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| postIdRequired | BadRequest | A postId is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NewsPostNotFound | NotFound | The specified news post could not be found. |

### News | Get a specific news

```http get-method
https:// post-methodhabitica.com/api/v4/news/:postId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| postId | String | The posts \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The news post (See [/website/server/models/newsPost.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js)) |

- [Post:](https://apidoc.habitica.com/#success-examples-News-GetNewsPost-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "title": "News Title",
  ...
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| postIdRequired | BadRequest | A postId is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NewsPostNotFound | NotFound | The specified news post could not be found. |

### News | Get latest Bailey announcement

```http get-method
https://habitica.com/api/v3/news
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| html | Object | Latest Bailey html |

### News | Get latest Bailey announcements

```http get-method
https://habitica.com/api/v4/news
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| page optional | Number | This parameter can be used to specify the page number (the initial page is number 0 and not required). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| Data | Array | An array of Bailey posts |

### News | Mark the latest Bailey announcement as read

```http post-method
https://habitica.com/api/v4/news/read
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

### News | Update a news post

```http put-method
https://habitica.com/api/v4/news/:postId
```

Permission: NewsPoster

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| postId | String | The posts \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated news post (See [/website/server/models/newsPost.js](https://apidoc.habitica.com/https://github.com/HabitRPG/habitica/blob/develop/website/server/models/newsPost.js)) |

- [Post:](https://apidoc.habitica.com/#success-examples-News-UpdateNewsPost-0_0_0-0)

```json
HTTP/1.1 200 OK
{
  "title": "News Title",
  ...
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| postIdRequired | BadRequest | A postId is required |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| NewsPostNotFound | NotFound | The specified news post could not be found. |

## Notification

### Notification | Mark multiple notifications as read

Marks multiple notifications as read by removing them from the user's notification list. This differs from marking notifications as seen, which retains them but sets the `seen` field to true.

```http post-method
https://habitica.com/api/v3/notifications/read
```

- [Request-Example:](https://apidoc.habitica.com/#examples-Notification-ReadNotifications-0_0_0-0)

```json
{
  "notificationIds": ["abcdef123", "ghi456789"]
}
```

#### Parameter

| Field | Type | Description |
| --- | --- | --- |
| notificationIds | String\[\] | Array of notification IDs to mark as read (required) |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object\[\] | Updated user.notifications array |

### Notification | Mark multiple notifications as seen

```http post-method
https://habitica.com/api/v3/notifications/see
```

- [Request-Example:](https://apidoc.habitica.com/#examples-Notification-SeeNotifications-0_0_0-0)

```json
{
  "notificationIds": ["abcdef123", "ghi456789"]
}
```

#### Parameter

| Field | Type | Description |
| --- | --- | --- |
| notificationIds | String\[\] | Required. Array of notification ID strings to mark as seen. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.notifications |

### Notification | Mark one notification as read

```http post-method
https://habitica.com/api/v3/notifications/:notificationId/read
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| notificationId | UUID | Required. ID of the notification to mark as read. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.notifications |

### Notification | Mark one notification as seen

Mark a notification as seen. Different from marking them as read in that the notification isn't removed but the `seen` field is set to `true`.

```http post-method
https://habitica.com/api/v3/notifications/:notificationId/see
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| notificationId | UUID |     |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The modified notification |

## Quest

### Quest | Abort the current quest

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/abort
```

Permission: QuestLeader GroupLeader

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

### Quest | Accept a pending quest

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/accept
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

### Quest | Cancel a quest that is not active

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/cancel
```

Permission: QuestLeader GroupLeader

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

### Quest | Force-start a pending quest

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/force-start
```

Permission: QuestLeader GroupLeader

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

### Quest | Invite users to a quest

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/invite/:questKey
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |
| questKey | String |     |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

### Quest | Leave the active quest

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/leave
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

### Quest | Reject a quest

```http post-method
https://habitica.com/api/v3/groups/:groupId/quests/reject
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | String | The group \_id (or 'party') |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Quest Object |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| GroupNotFound | NotFound | The specified group could not be found. |
| QuestNotFound | NotFound | The specified quest could not be found. |

## Status

### Status | Get Habitica's API status

```http get-method
https://habitica.com/api/v3/status
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| status | String | 'up' if everything is ok |

- [Server is Up](https://apidoc.habitica.com/#success-examples-Status-GetStatus-0_0_0-0)

```json
{
  'status': 'up',
}
```

### Status | Get Habitica's Server readiness status

```http get-method
https://habitica.com/api/v3/ready
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| status | String | 'ready' if everything is ok |

- [Server is Ready](https://apidoc.habitica.com/#success-examples-Status-GetReady-0_0_0-0)

```json
{
  'status': 'ready',
}
```

## Tag

### Tag | Create a new tag

```http post-method
https://habitica.com/api/v3/tags
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| name | string | The name of the tag to be added. |

- [Example body:](https://apidoc.habitica.com/#parameter-examples-Tag-CreateTag-0_0_0-0)

```json
{
    "name": "practicetag"
}
```

#### 201

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The newly created tag |

- [Example return:](https://apidoc.habitica.com/#success-examples-Tag-CreateTag-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "name": "practicetag",
        "id": "8bc0afbf-ab8e-49a4-982d-67a40557ed1a"
    },
    "notifications": []
}
```

### Tag | Delete a user tag

```http delete-method
https://habitica.com/api/v3/tags/:tagId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| tagId | UUID | The tag \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

- [Example return:](https://apidoc.habitica.com/#success-examples-Tag-DeleteTag-0_0_0-0)

```jsom
{"success":true,"data":{},"notifications":[]}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| InvalidRequestParameters | BadRequest | "tagId" must be a valid UUID corresponding to a tag belonging to the user. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TagNotFound | NotFound | The specified tag could not be found. |

### Tag | Get a tag

```http get-method
https://habitica.com/api/v3/tags/:tagId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| tagId | UUID | The tag \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The tag object |

- [Example return:](https://apidoc.habitica.com/#success-examples-Tag-GetTag-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "name": "practicetag",
        "id": "8bc0afbf-ab8e-49a4-982d-67a40557ed1a"
    },
    "notifications": []
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| InvalidRequestParameters | BadRequest | "tagId" must be a valid UUID corresponding to a tag belonging to the user. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TagNotFound | NotFound | The specified tag could not be found. |

### Tag | Get a user's tags

```http get-method
https://habitica.com/api/v3/tags
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of tags |

- [Example return:](https://apidoc.habitica.com/#success-examples-Tag-GetTags-0_0_0-0)

```json
{
    "success": true,
    "data": [
        {
            "name": "Work",
            "id": "3d5d324d-a042-4d5f-872e-0553e228553e"
        },
        {
            "name": "apitester",
            "challenge": "true",
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        {
            "name": "practicetag",
            "id": "8bc0afbf-ab8e-49a4-982d-67a40557ed1a"
        }
    ],
    "notifications": []
}
```

### Tag | Reorder a tag

```http post-method
https://habitica.com/api/v3/reorder-tags
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| tagId | UUID | Id of the tag to move |
| to  | Number | Position the tag is moving to |

- [Example request:](https://apidoc.habitica.com/#parameter-examples-Tag-ReorderTags-0_0_0-0)

```json
{
    "tagId": "c6855fae-ca15-48af-a88b-86d0c65ead47",
    "to": 0
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

- [Example return:](https://apidoc.habitica.com/#success-examples-Tag-ReorderTags-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TagNotFound | NotFound | The specified tag could not be found. |

### Tag | Update a tag

```http put-method
https://habitica.com/api/v3/tags/:tagId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| tagId | UUID | The tag \_id |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| name | string | The new name of the tag. |

- [Example body:](https://apidoc.habitica.com/#parameter-examples-Tag-UpdateTag-0_0_0-0)

```json
{
    "name": "prac-tag"
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated tag |

- [Example result:](https://apidoc.habitica.com/#success-examples-Tag-UpdateTag-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "name": "practice-tag",
        "id": "8bc0afbf-ab8e-49a4-982d-67a40557ed1a"
    },
    "notifications": []
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| InvalidRequestParameters | BadRequest | "tagId" must be a valid UUID corresponding to a tag belonging to the user. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TagNotFound | NotFound | The specified tag could not be found. |

## Task

### Task | Add a tag to a task

```http post-method
https://habitica.com/api/v3/tasks/:taskId/tags/:tagId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| tagId | UUID | The tag id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-AddTagToTask-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "_id": "84f02d6a-7b43-4818-a35c-d3336cec4880",
        "userId": "b0413351-405f-416f-8787-947ec1c85199",
        "text": "Test API Params",
        "alias": "test-api-params",
        "type": "todo",
        "notes": "",
        "tags": [
            "3d5d324d-a042-4d5f-872e-0553e228553e"
        ],
        "value": -1,
        "priority": 2,
        "attribute": "int",
        "challenge": {
            "taskId": "4a29874c-0308-417b-a909-2a7d262b49f6",
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "createdAt": "2017-01-13T21:23:05.949Z",
        "updatedAt": "2017-01-14T19:41:29.466Z",
        "checklist": [],
        "collapseChecklist": false,
        "completed": false,
        "id": "84f02d6a-7b43-4818-a35c-d3336cec4880"
    },
    "notifications": []
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| Invalid-request-parameters | BadRequest | "tagId" must be a valid UUID corresponding to a tag belonging to the user. |
| TagExists | BadRequest | The task is already tagged with given tag. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Add an item to the task's checklist

```http post-method
https://habitica.com/api/v3/tasks/:taskId/checklist
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| text | String | The text of the checklist item |
| completed optional | Boolean | Whether the checklist item is checked off.<br><br>Default value: `false` |

- [Example body data:](https://apidoc.habitica.com/#parameter-examples-Task-AddChecklistItem-0_0_0-0)

```json
{
    "text": "Do this subtask"
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-AddChecklistItem-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "_id": "84f02d6a-7b43-4818-a35c-d3336cec4880",
        "userId": "b0413351-405f-416f-8787-947ec1c85199",
        "text": "Test API Params",
        "alias": "test-api-params",
        "type": "todo",
        "notes": "",
        "tags": [],
        "value": 0,
        "priority": 2,
        "attribute": "int",
        "challenge": {
            "taskId": "4a29874c-0308-417b-a909-2a7d262b49f6",
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "createdAt": "2017-01-13T21:23:05.949Z",
        "updatedAt": "2017-01-14T03:38:07.406Z",
        "checklist": [
            {
                "id": "afe4079d-dff1-47d9-9b06-5d76c69ddb12",
                "text": "Do this subtask",
                "completed": false
            }
        ],
        "collapseChecklist": false,
        "completed": false,
        "id": "84f02d6a-7b43-4818-a35c-d3336cec4880"
    },
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Assign a group task to a user or users

Assign users to a group task

```http post-method
https://habitica.com/api/v3/tasks/:taskId/assign
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | UUID | The id of the task that will be assigned |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| assignedUserIds optional | UUID\[\] | Array of user IDs to be assigned to the task |

#### Success 200

| Field | Description |
| --- | --- |
| data | The assigned task |

### Task | Create a new task belonging to a challenge

Can be passed an object to create a single task or an array of objects to create multiple tasks.

```http post-method
https://habitica.com/api/v3/tasks/challenge/:challengeId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The id of the challenge the new task(s) will belong to |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| text | String | The text to be displayed for the task |
| type | String | Task type, options are: "habit", "daily", "todo", "reward".<br><br>Allowed values: `"habit"`, `"daily"`, `"todo"`, `"reward"` |
| attribute optional | String | User's attribute to use, options are: "str", "int", "per", "con".<br><br>Allowed values: `"str"`, `"int"`, `"per"`, `"con"` |
| collapseChecklist optional | Boolean | Determines if a checklist will be displayed<br><br>Default value: `false` |
| notes optional | String | Extra notes |
| date optional | Date | Due date to be shown in task list. Only valid for type "todo." |
| priority optional | Number | Difficulty, options are 0.1, 1, 1.5, 2; equivalent of Trivial, Easy, Medium, Hard.<br><br>Default value: `1`<br><br>Allowed values: `"0.1"`, `"1"`, `"1.5"`, `"2"` |
| reminders optional | String\[\] | Array of reminders, each an object that must include: a UUID, startDate and time. For example {"id":"ed427623-9a69-4aac-9852-13deb9c190c3", "startDate":"1/16/17","time":"1/16/17" } |
| frequency optional | String | Values "weekly" and "monthly" enable use of the "repeat" field. All frequency values enable use of the "everyX" field. Value "monthly" enables use of the "weeksOfMonth" and "daysOfMonth" fields. Frequency is only valid for type "daily".<br><br>Default value: `weekly`<br><br>Allowed values: `"daily"`, `"weekly"`, `"monthly"`, `"yearly"` |
| repeat optional | String | List of objects for days of the week, Days that are true will be repeated upon. Only valid for type "daily". Any days not specified will be marked as true. Days are: su, m, t, w, th, f, s. Value of frequency must be "weekly". For example, to skip repeats on Mon and Fri: "repeat":{"f":false,"m":false}<br><br>Default value: `true` |
| everyX optional | Number | Value of frequency must be "daily", the number of days until this daily task is available again.<br><br>Default value: `1` |
| streak optional | Number | Number of days that the task has consecutively been checked off. Only valid for type "daily"<br><br>Default value: `0` |
| daysOfMonth | Integer\[\] | Array of integers. Only valid for type "daily" |
| weeksOfMonth | Integer\[\] | Array of integers. Only valid for type "daily" |
| startDate optional | Date | Date when the task will first become available. Only valid for type "daily" |
| up optional | Boolean | Only valid for type "habit" If true, enables the "+" under "Directions/Action" for "Good habits"<br><br>Default value: `true` |
| down optional | Boolean | Only valid for type "habit" If true, enables the "-" under "Directions/Action" for "Bad habits"<br><br>Default value: `true` |
| value optional | Number | Only valid for type "reward." The cost in gold of the reward<br><br>Default value: `0` |

- [Request-Example:](https://apidoc.habitica.com/#parameter-examples-Task-CreateChallengeTasks-0_0_0-0)

```json
{
    "type": "todo",
    "text": "Test API Params"
}
```

#### 201

| Field | Description |
| --- | --- |
| data | An object if a single task was created, otherwise an array of tasks |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-CreateChallengeTasks-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "text": "Test API Params",
        "type": "todo",
        "notes": "",
        "tags": [],
        "value": 0,
        "priority": 1,
        "attribute": "str",
        "challenge": {
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "_id": "4a29874c-0308-417b-a909-2a7d262b49f6",
        "createdAt": "2017-01-13T21:23:05.949Z",
        "updatedAt": "2017-01-13T21:23:05.949Z",
        "checklist": [],
        "collapseChecklist": false,
        "completed": false,
        "id": "4a29874c-0308-417b-a909-2a7d262b49f6"
    },
    "notifications": []
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| MustBeType | BadRequest | Task type must be one of "habit", "daily", "todo", "reward". |
| Text-ValidationFailed | BadRequest | Path 'text' is required. |
| Alias-ValidationFailed | BadRequest | Task short names can only contain alphanumeric characters, underscores and dashes. |
| Value-ValidationFailed | BadRequest | `x` is not a valid enum value for path `(body param)`. |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAccount | NotAuthorized | There is no account that uses those credentials. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChecklistNotFound | NotFound | The specified checklist item could not be found. |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Task | Create a new task belonging to a group

Can be passed an object to create a single task or an array of objects to create multiple tasks.

```http post-method
https://habitica.com/api/v3/tasks/group/:groupId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The id of the group the new task(s) will belong to |

#### Success 200

| Field | Description |
| --- | --- |
| data | An object if a single task was created, otherwise an array of tasks |

### Task | Create a new task belonging to the user

Can be passed an object to create a single task or an array of objects to create multiple tasks.

```http post-method
https://habitica.com/api/v3/tasks/user
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| text | String | The text to be displayed for the task |
| type | String | Task type, options are: "habit", "daily", "todo", "reward".<br><br>Allowed values: `"habit"`, `"daily"`, `"todo"`, `"reward"` |
| tags optional | String\[\] | Array of UUIDs of tags |
| alias optional | String | Alias to assign to task |
| attribute optional | String | User's attribute to use, options are: "str", "int", "per", "con"<br><br>Allowed values: `"str"`, `"int"`, `"per"`, `"con"` |
| checklist optional | Array | An array of checklist items. For example, \[{"text":"buy tools", "completed":true}, {"text":"build shed", "completed":false}\] |
| collapseChecklist optional | Boolean | Determines if a checklist will be displayed<br><br>Default value: `false` |
| notes optional | String | Extra notes |
| date optional | Date | Due date to be shown in task list. Only valid for type "todo." |
| priority optional | Number | Difficulty, options are 0.1, 1, 1.5, 2; equivalent of Trivial, Easy, Medium, Hard.<br><br>Default value: `1`<br><br>Allowed values: `"0.1"`, `"1"`, `"1.5"`, `"2"` |
| reminders optional | String\[\] | Array of reminders, each an object that must include: a UUID, startDate and time. For example {"id":"ed427623-9a69-4aac-9852-13deb9c190c3", "startDate":"1/16/17","time":"1/16/17" } |
| frequency optional | String | Values "weekly" and "monthly" enable use of the "repeat" field. All frequency values enable use of the "everyX" field. Value "monthly" enables use of the "weeksOfMonth" and "daysOfMonth" fields. Frequency is only valid for type "daily".<br><br>Default value: `weekly`<br><br>Allowed values: `"daily"`, `"weekly"`, `"monthly"`, `"yearly"` |
| repeat optional | String | List of objects for days of the week, Days that are true will be repeated upon. Only valid for type "daily". Any days not specified will be marked as true. Days are: su, m, t, w, th, f, s. Value of frequency must be "weekly". For example, to skip repeats on Mon and Fri: "repeat":{"f":false,"m":false}<br><br>Default value: `true` |
| everyX optional | Number | Value of frequency must be "daily", the number of days until this daily task is available again.<br><br>Default value: `1` |
| streak optional | Number | Number of days that the task has consecutively been checked off. Only valid for type "daily"<br><br>Default value: `0` |
| daysOfMonth | Integer\[\] | Array of integers. Only valid for type "daily" |
| weeksOfMonth | Integer\[\] | Array of integers. Only valid for type "daily" |
| startDate optional | Date | Date when the task will first become available. Only valid for type "daily" |
| up optional | Boolean | Only valid for type "habit" If true, enables the "+" under "Directions/Action" for "Good habits"-<br><br>Default value: `true` |
| down optional | Boolean | Only valid for type "habit" If true, enables the "-" under "Directions/Action" for "Bad habits"<br><br>Default value: `true` |
| value optional | Number | Only valid for type "reward." The cost in gold of the reward. Should be greater then or equal to 0.<br><br>Default value: `0` |

- [Request-Example:](https://apidoc.habitica.com/#parameter-examples-Task-CreateUserTasks-0_0_0-0)

```json
{
    "text": "Update Habitica API Documentation - Tasks",
    "type": "todo",
    "alias": "hab-api-tasks",
    "notes": "Update the tasks api on GitHub",
    "tags": [
        "ed427623-9a69-4aac-9852-13deb9c190c3"
    ],
    "checklist": [
        {
            "text": "read wiki",
            "completed": true
        },
        {
            "text": "write code"
        }
    ],
    "priority": 2
}
```

#### 201

| Field | Description |
| --- | --- |
| data | An object if a single task was created, otherwise an array of tasks |

- [Success-Response:](https://apidoc.habitica.com/#success-examples-Task-CreateUserTasks-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "userId": "b0413351-405f-416f-8787-947ec1c85199",
        "alias": "hab-api-tasks",
        "text": "Update Habitica API Documentation - Tasks",
        "type": "todo",
        "notes": "Update the tasks api on GitHub",
        "tags": [
            "ed427623-9a69-4aac-9852-13deb9c190c3"
        ],
        "value": 0,
        "priority": 2,
        "attribute": "str",
        "challenge": {},
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "_id": "829d435b-edc4-498c-a30e-e52361a0f35a",
        "createdAt": "2017-01-12T02:11:02.876Z",
        "updatedAt": "2017-01-12T02:11:02.876Z",
        "checklist": [
            {
                "completed": true,
                "text": "read wiki",
                "id": "91edadda-fb62-4e6e-b110-aff26f936678"
            },
            {
                "completed": false,
                "text": "write code",
                "id": "d1ddad50-ab22-49c4-8261-9996ae337b6a"
            }
        ],
        "collapseChecklist": false,
        "completed": false,
        "id": "829d435b-edc4-498c-a30e-e52361a0f35a"
    },
    "notifications": []
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| MustBeType | BadRequest | Task type must be one of "habit", "daily", "todo", "reward". |
| Text-ValidationFailed | BadRequest | Path 'text' is required. |
| Alias-ValidationFailed | BadRequest | Task short names can only contain alphanumeric characters, underscores and dashes. |
| Value-ValidationFailed | BadRequest | `x` is not a valid enum value for path `(body param)`. |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAccount | NotAuthorized | There is no account that uses those credentials. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChecklistNotFound | NotFound | The specified checklist item could not be found. |

- [Error-Response:](https://apidoc.habitica.com/#error-examples-Task-CreateUserTasks-0_0_0-0)

```json
{
    "success": false,
    "error": "BadRequest",
    "message": "todo validation failed",
    "errors": [
        {
            "message": "Path `text` is required.",
            "path": "text"
        }
    ]
}
```

### Task | Delete a checklist item from a task

```http delete-method
https://habitica.com/api/v3/tasks/:taskId/checklist/:itemId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| itemId | UUID | The checklist item \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-RemoveChecklistItem-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "_id": "84f02d6a-7b43-4818-a35c-d3336cec4880",
        "userId": "b0413351-405f-416f-8787-947ec1c85199",
        "text": "Test API Params",
        "alias": "test-api-params",
        "type": "todo",
        "notes": "",
        "tags": [],
        "value": -1,
        "priority": 2,
        "attribute": "int",
        "challenge": {
            "taskId": "4a29874c-0308-417b-a909-2a7d262b49f6",
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "createdAt": "2017-01-13T21:23:05.949Z",
        "updatedAt": "2017-01-14T19:35:41.881Z",
        "checklist": [],
        "collapseChecklist": false,
        "completed": false,
        "id": "84f02d6a-7b43-4818-a35c-d3336cec4880"
    },
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |
| ChecklistNotFound | NotFound | The specified checklist item could not be found. |

### Task | Delete a tag from a task

```http delete-method
https://habitica.com/api/v3/tasks/:taskId/tags/:tagId
```

- [Example use:](https://apidoc.habitica.com/#examples-Task-RemoveTagFromTask-0_0_0-0)

```curl
curl -X "DELETE" https://habitica.com/api/v3/tasks/test-api-params/tags/3d5d324d-a042-4d5f-872e-0553e228553e
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| tagId | UUID | The tag id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-RemoveTagFromTask-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "_id": "84f02d6a-7b43-4818-a35c-d3336cec4880",
        "userId": "b0413351-405f-416f-8787-947ec1c85199",
        "text": "Test API Params",
        "alias": "test-api-params",
        "type": "todo",
        "notes": "",
        "tags": [],
        "value": -1,
        "priority": 2,
        "attribute": "int",
        "challenge": {
            "taskId": "4a29874c-0308-417b-a909-2a7d262b49f6",
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "createdAt": "2017-01-13T21:23:05.949Z",
        "updatedAt": "2017-01-14T20:02:18.206Z",
        "checklist": [],
        "collapseChecklist": false,
        "completed": false,
        "id": "84f02d6a-7b43-4818-a35c-d3336cec4880"
    },
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |
| TagNotFound | NotFound | The specified tag could not be found. |

### Task | Delete a task

```http delete-method
https://habitica.com/api/v3/tasks/:taskId
```

- [Example call:](https://apidoc.habitica.com/#examples-Task-DeleteTask-0_0_0-0)

```json
curl -X "DELETE" https://habitica.com/api/v3/tasks/3d5d324d-a042-4d5f-872e-0553e228553e
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| Challenge | NotAuthorized | A task belonging to a challenge can't be deleted. |
| Group | NotAuthorized | Can't delete group tasks that are assigned to you |
| ChallengeLeader | NotAuthorized | Tasks belonging to a challenge can only be edited by the leader. |
| GroupLeader | NotAuthorized | Not authorized to manage tasks! |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Delete user's completed todos

Deletes all of a user's completed To Do's except those belonging to active Challenges and Group Plans.

```http post-method
https://habitica.com/api/v3/tasks/clearCompletedTodos
```

- [Example call:](https://apidoc.habitica.com/#examples-Task-ClearCompletedTodos-0_0_0-0)

```curl
curl -X "POST" https://habitica.com/api/v3/tasks/ClearCompletedTodos
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-ClearCompletedTodos-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "notifications": []
}
```

### Task | Get a challenge's tasks

```http get-method
https://habitica.com/api/v3/tasks/challenge/:challengeId
```

- [Example use:](https://apidoc.habitica.com/#examples-Task-GetChallengeTasks-0_0_0-0)

```curl
curl -i https://habitica.com/api/v3/tasks/challenge/f23c12f2-5830-4f15-9c36-e17fd729a812
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The id of the challenge from which to retrieve the tasks |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| type optional | String | Query parameter to return just a type of tasks.<br><br>Allowed values: `"habits"`, `"dailys"`, `"todos"`, `"rewards"` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of tasks |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-GetChallengeTasks-0_0_0-0)

```json
{
    "success": true,
    "data": [
        {
            "_id": "5f12bfba-da30-4733-ad01-9c42f9817975",
            "text": "API Trial",
            "type": "habit",
            "notes": "",
            "tags": [],
            "value": 27.70767809690112,
            "priority": 1.5,
            "attribute": "str",
            "challenge": {
                "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
            },
            "group": {
                "assignedUsers": [],
                "approval": {
                    "required": false,
                    "approved": false,
                    "requested": false
                }
            },
            "reminders": [],
            "createdAt": "2017-01-12T19:03:33.485Z",
            "updatedAt": "2017-01-13T17:45:52.442Z",
            "history": [
                {
                    "date": 1484257319183,
                    "value": 18.53316748293123
                },
                {
                    "date": 1484329552441,
                    "value": 27.70767809690112
                }
            ],
            "down": false,
            "up": true,
            "id": "5f12bfba-da30-4733-ad01-9c42f9817975"
        },
        {
            "_id": "54a81d23-529c-4daa-a6f7-c5c6e7e84936",
            "text": "Challenge TODO",
            "type": "todo",
            "notes": "",
            "tags": [],
            "value": 2,
            "priority": 2,
            "attribute": "str",
            "challenge": {
                "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
            },
            "group": {
                "assignedUsers": [],
                "approval": {
                    "required": false,
                    "approved": false,
                    "requested": false
                }
            },
            "reminders": [],
            "createdAt": "2017-01-12T19:07:10.310Z",
            "updatedAt": "2017-01-13T20:24:51.070Z",
            "checklist": [],
            "collapseChecklist": false,
            "completed": false,
            "id": "54a81d23-529c-4daa-a6f7-c5c6e7e84936"
        }
    ],
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Task | Get a group's tasks

```http get-method
https://habitica.com/api/v3/tasks/group/:groupId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| groupId | UUID | The id of the group from which to retrieve the tasks |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| type optional | string | Query parameter to return just a type of tasks<br><br>Allowed values: `"habits"`, `"dailys"`, `"todos"`, `"rewards"` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of tasks |

### Task | Get a task

```http get-method
https://habitica.com/api/v3/tasks/:taskId
```

- [Example use:](https://apidoc.habitica.com/#examples-Task-GetTask-0_0_0-0)

```curl
curl -i https://habitica.com/api/v3/tasks/54a81d23-529c-4daa-a6f7-c5c6e7e84936
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The task object |

- [Example returned object:](https://apidoc.habitica.com/#success-examples-Task-GetTask-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "_id": "2b774d70-ec8b-41c1-8967-eb6b13d962ba",
        "userId": "b0413351-405f-416f-8787-947ec1c85199",
        "text": "API Trial",
        "alias": "apiTrial",
        "type": "habit",
        "notes": "",
        "tags": [],
        "value": 11.996661122825959,
        "priority": 1.5,
        "attribute": "str",
        "challenge": {
            "taskId": "5f12bfba-da30-4733-ad01-9c42f9817975",
            "id": "f23c12f2-5830-4f15-9c36-e17fd729a812"
        },
        "group": {
            "assignedUsers": [],
            "approval": {
                "required": false,
                "approved": false,
                "requested": false
            }
        },
        "reminders": [],
        "createdAt": "2017-01-12T19:03:33.495Z",
        "updatedAt": "2017-01-13T20:52:02.927Z",
        "history": [
            {
                "value": 1,
                "date": 1484248053486
            },
            {
                "value": 1.9747,
                "date": 1484252965224
            },
            {
                "value": 2.9253562257358428,
                "date": 1484252966902
            },
            {
                "value": 6.415599723011605,
                "date": 1484329050485
            },
            {
                "value": 10.482627142836241,
                "date": 1484329089835
            },
            {
                "value": 11.24705848799571,
                "date": 1484329095500
            },
            {
                "value": 11.996661122825959,
                "date": 1484329552423
            }
        ],
        "down": false,
        "up": true,
        "id": "2b774d70-ec8b-41c1-8967-eb6b13d962ba"
    },
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Get a user's tasks

```http get-method
https://habitica.com/api/v3/tasks/user
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| type optional | String | Optional query parameter to return just a type of tasks. By default all types will be returned except completed todos that must be requested separately. The "completedTodos" type returns only the 30 most recently completed.<br><br>Allowed values: `"habits"`, `"dailys"`, `"todos"`, `"rewards"`, `"completedTodos"` |
| dueDate optional |     | type Optional date to use for computing the nextDue field for each returned task. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | An array of tasks |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-GetUserTasks-0_0_0-0)

```json
{"success":true,"data":[{"_id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3",
"userId":"b0413351-405f-416f-8787-947ec1c85199","text":"15 minute break",
"type":"reward","notes":"","tags":[],"value":10,"priority":1,"attribute":"str",
"challenge":{},"group":{"assignedUsers":[],"approval":{"required":false,"approved":false,
"requested":false}},"reminders":[],"createdAt":"2017-01-07T17:52:09.121Z",
"updatedAt":"2017-01-11T14:25:32.504Z","id":"8a9d461b-f5eb-4a16-97d3-c03380c422a3"},
,{"_id":"84c2e874-a8c9-4673-bd31-d97a1a42e9a3","userId":"b0413351-405f-416f-8787-947ec1c85199",
"alias":"prac31","text":"Practice Task 31","type":"daily","notes":"","tags":[],"value":1,
"priority":1,"attribute":"str","challenge":{},"group":{"assignedUsers":[],
"approval":{"required":false,"approved":false,"requested":false}},
"reminders":[{"time":"2017-01-13T16:21:00.074Z","startDate":"2017-01-13T16:20:00.074Z",
"id":"b8b549c4-8d56-4e49-9b38-b4dcde9763b9"}],"createdAt":"2017-01-13T16:34:06.632Z",
"updatedAt":"2017-01-13T16:49:35.762Z","checklist":[],"collapseChecklist":false,
"completed":true,"history":[],"streak":1,"repeat":{"su":false,"s":false,"f":true,
"th":true,"w":true,"t":true,"m":true},"startDate":"2017-01-13T00:00:00.000Z",
"everyX":1,"frequency":"weekly","id":"84c2e874-a8c9-4673-bd31-d97a1a42e9a3"}],"notifications":[]}
```

#### 401

| Name | Type | Description |
| --- | --- | --- |
| NoAccount | NotAuthorized | There is no account that uses those credentials. |

#### BadRequest

| Name | Type | Description |
| --- | --- | --- |
| Invalid\_request\_parameters |     | Error returned if the type URL param was not correct. |

### Task | Move a group task to a specified position

Moves a group task to a specified position

```http post-method
https://habitica.com/api/v3/group/:groupId/tasks/:taskId/move/to/:position
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id |
| position | Number | Where to move the task. 0 = top of the list ("push to top"). -1 = bottom of the list ("push to bottom"). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | The new tasks order (group.tasksOrder.{task.type}s) |

### Task | Move a task to a new position

Note: completed To Do's are not sortable, do not appear in user.tasksOrder.todos, and are ordered by date of completion.

```http post-method
https://habitica.com/api/v3/tasks/:taskId/move/to/:position
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| position | Number | Where to move the task. 0 = top of the list ("push to top"). -1 = bottom of the list ("push to bottom"). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | The new tasks order for the specific type that the taskID belongs to. |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-MoveTask-0_0_0-0)

```json
{
    "success": true,
    "data": [
        "8d7e237a-b259-46ee-b431-33621256bb0b",
        "2b774d70-ec8b-41c1-8967-eb6b13d962ba",
        "f03d4a2b-9c36-4f33-9b5f-bae0aed23a49"
    ],
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Require more work for a group task

Mark an assigned group task as needing more work before it can be approved

```http post-method
https://habitica.com/api/v3/tasks/:taskId/needs-work/:userId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | UUID | The id of the task that is the original group task |
| userId | UUID | The id of the assigned user |

#### Success 200

| Field | Description |
| --- | --- |
| task | The task that needs more work |

### Task | Score a checklist item

```http post-method
https://habitica.com/api/v3/tasks/:taskId/checklist/:itemId/score
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| itemId | UUID | The checklist item \_id |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |
| ChecklistNotFound | NotFound | The specified checklist item could not be found. |

### Task | Score a task

```http post-method
https://habitica.com/api/v3/tasks/:taskId/score/:direction
```

- [Example call:](https://apidoc.habitica.com/#examples-Task-ScoreTask-0_0_0-0)

```json
curl -X "POST" https://habitica.com/api/v3/tasks/test-api-params/score/up
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| direction | String | The direction for scoring the task<br><br>Allowed values: `"up"`, `"down"` |

#### 202

| Field | Type | Description |
| --- | --- | --- |
| requiresApproval | Boolean | Approval was requested for team task |
| message | String | Acknowledgment of team task approval request |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The user stats |
| \_tmp | Object | If an item was dropped it'll be returned in te \_tmp object |
| delta | Number | The delta |

- [Example result:](https://apidoc.habitica.com/#success-examples-Task-ScoreTask-0_0_0-0)
- [Example result with item drop:](https://apidoc.habitica.com/#success-examples-Task-ScoreTask-0_0_0-1)

```json
{
    "success": true,
    "data": {
        "delta": 0.9746999906450404,
        "_tmp": {},
        "hp": 49.06645205596985,
        "mp": 37.2008917491047,
        "exp": 101.93810026267543,
        "gp": 77.09694176716997,
        "lvl": 19,
        "class": "rogue",
        "points": 0,
        "str": 5,
        "con": 3,
        "int": 3,
        "per": 8,
        "buffs": {
            "str": 9,
            "int": 9,
            "per": 9,
            "con": 9,
            "stealth": 0,
            "streaks": false,
            "snowball": false,
            "spookySparkles": false,
            "shinySeed": false,
            "seafoam": false
        },
        "training": {
            "int": 0,
            "per": 0,
            "str": 0,
            "con": 0
        }
    },
    "notifications": []
}
```

```json
{
    "success": true,
    "data": {
        "delta": 1.0259567046270648,
        "_tmp": {
            "quest": {
                "progressDelta": 1.2362778290756147,
                "collection": 1
            },
            "drop": {
                "target": "Zombie",
                "canDrop": true,
                "value": 1,
                "key": "RottenMeat",
                "type": "Food",
                "dialog": "You've found Rotten Meat! Feed this to a pet and it may grow into a sturdy steed."
            }
        },
        "hp": 50,
        "mp": 66.2390716654227,
        "exp": 143.93810026267545,
        "gp": 135.12889840462591,
        "lvl": 20,
        "class": "rogue",
        "points": 0,
        "str": 6,
        "con": 3,
        "int": 3,
        "per": 8,
        "buffs": {
            "str": 10,
            "int": 10,
            "per": 10,
            "con": 10,
            "stealth": 0,
            "streaks": false,
            "snowball": false,
            "spookySparkles": false,
            "shinySeed": false,
            "seafoam": false
        },
        "training": {
            "int": 0,
            "per": 0,
            "str": 0,
            "con": 0
        }
    },
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Unassign a user from a task

Unassigns a user from a group task

```http post-method
https://habitica.com/api/v3/tasks/:taskId/unassign/:assignedUserId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | UUID | The id of the task that is the original group task |
| assignedUserId | UUID | The id of the user that will be unassigned from the task |

#### Success 200

| Field | Description |
| --- | --- |
| data | The unassigned task |

### Task | Unlink a challenge task

```http post-method
https://habitica.com/api/v3/tasks/unlink-one/:taskId
```

- [Example call:](https://apidoc.habitica.com/#examples-Task-UnlinkOneTask-0_0_0-0)

```curl
curl -X "POST" https://habitica.com/api/v3/tasks/unlink-one/ee882e1d-ebd1-4716-88f2-4f9e47d947a8?keep=keep
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| keep | String | Specifies if the task should be kept(keep) or removed(remove).<br><br>Allowed values: `'keep'`, `'remove'` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| Broken | BadRequest | Only broken challenges tasks can be unlinked. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### Task | Unlink all tasks from a challenge

```http post-method
https://habitica.com/api/v3/tasks/unlink-all/:challengeId
```

- [Example call:](https://apidoc.habitica.com/#examples-Task-UnlinkAllTasks-0_0_0-0)

```curl
curl -X "POST" https://habitica.com/api/v3/tasks/unlink-all/f23c12f2-5830-4f15-9c36-e17fd729a812?keep=remove-all
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| challengeId | UUID | The challenge \_id |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| keep | String | Specifies if tasks should be kept(keep-all) or removed(remove-all) after the unlink.<br><br>Allowed values: `'keep-all'`, `'remove-all'` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty object |

- [Example return:](https://apidoc.habitica.com/#success-examples-Task-UnlinkAllTasks-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "notifications": []
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| Broken | BadRequest | Only broken challenges tasks can be unlinked. |

### Task | Update a checklist item

```http put-method
https://habitica.com/api/v3/tasks/:taskId/checklist/:itemId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |
| itemId | UUID | The checklist item \_id |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| text | String | The replacement text for the current checklist item. |
| completed optional | Boolean | Whether the checklist item is checked off.<br><br>Default value: `false` |

- [Example body:](https://apidoc.habitica.com/#parameter-examples-Task-UpdateChecklistItem-0_0_0-0)

```json
{
    "text": "learn Czech",
    "completed": true
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |
| ChecklistNotFound | NotFound | The specified checklist item could not be found. |
| ChallengeNotFound | NotFound | The specified challenge could not be found. |

### Task | Update a task

```http put-method
https://habitica.com/api/v3/tasks/:taskId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| taskId | String | The task \_id or alias |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| text optional | String | The text to be displayed for the task |
| attribute optional | String | User's attribute to use, options are: "str", "int", "per", "con".<br><br>Allowed values: `"str"`, `"int"`, `"per"`, `"con"` |
| collapseChecklist optional | Boolean | Determines if a checklist will be displayed<br><br>Default value: `false` |
| notes optional | String | Extra notes |
| date optional | Date | Due date to be shown in task list. Only valid for type "todo." |
| priority optional | Number | Difficulty, options are 0.1, 1, 1.5, 2; equivalent of Trivial, Easy, Medium, Hard.<br><br>Default value: `1`<br><br>Allowed values: `"0.1"`, `"1"`, `"1.5"`, `"2"` |
| reminders optional | String\[\] | Array of reminders, each an object that must include: a UUID, startDate and time. |
| frequency optional | String | Values "weekly" and "monthly" enable use of the "repeat" field. All frequency values enable use of the "everyX" field. Value "monthly" enables use of the "weeksOfMonth" and "daysOfMonth" fields. Frequency is only valid for type "daily".<br><br>Default value: `weekly`<br><br>Allowed values: `"daily"`, `"weekly"`, `"monthly"`, `"yearly"` |
| repeat optional | String | List of objects for days of the week, Days that are true will be repeated upon. Only valid for type "daily". Any days not specified will be marked as true. Days are: su, m, t, w, th, f, s. Value of frequency must be "weekly". For example, to skip repeats on Mon and Fri: "repeat":{"f":false,"m":false}<br><br>Default value: `true` |
| everyX optional | Number | Value of frequency must be "daily", the number of days until this daily task is available again.<br><br>Default value: `1` |
| streak optional | Number | Number of days that the task has consecutively been checked off. Only valid for type "daily",<br><br>Default value: `0` |
| daysOfMonth | Integer\[\] | Array of integers. Only valid for type "daily" |
| weeksOfMonth | Integer\[\] | Array of integers. Only valid for type "daily" |
| startDate optional | Date | Date when the task will first become available. Only valid for type "daily". |
| up optional | Boolean | Only valid for type "habit" If true, enables the "+" under "Directions/Action" for "Good habits".<br><br>Default value: `true` |
| down optional | Boolean | Only valid for type "habit" If true, enables the "-" under "Directions/Action" for "Bad habits".<br><br>Default value: `true` |
| value optional | Number | Only valid for type "reward." The cost in gold of the reward<br><br>Default value: `0` |

- [Request-Example:](https://apidoc.habitica.com/#parameter-examples-Task-UpdateTask-0_0_0-0)

```json
{
    "notes": "This will be replace the notes, anything not specified will remain the same"
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated task |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

## Unsubscribe

### Unsubscribe | Unsubscribe an email address or user from email notifications

This is a POST method for compliance with RFC 8058. It works identically to the GET method on the same URI, allowing the user to unsubscribe from emails either via visiting a hyperlink or activating a one-click Unsubscribe button in their email client. Does not require authentication.

```http post-method
https://habitica.com/email/unsubscribe
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| code | String | An unsubscription code that contains an encrypted User ID or email address |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| Webpage | String | An html success message |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| missingUnsubscriptionCode | BadRequest | The unsubscription code is missing. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

### Unsubscribe | Unsubscribe an email address or user from email notifications

This is a GET method included in official emails from Habitica that will unsubscribe the user from emails. Does not require authentication.

```http get-method
https://habitica.com/email/unsubscribe
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| code | String | An unsubscription code that contains an encrypted User ID or email address |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| Webpage | String | An html success message |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| missingUnsubscriptionCode | BadRequest | The unsubscription code is missing. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| UserNotFound | NotFound | The specified user could not be found. |

## User

### User | Allocate a single Stat Point (previously called Attribute Point)

Allocates a single Stat Point.

```http post-method
https://habitica.com/api/v3/user/allocate
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| stat | String | The Stat to increase. Default is 'str'<br><br>Allowed values: `"str"`, `"con"`, `"int"`, `"per"` |

- [Example call:](https://apidoc.habitica.com/#parameter-examples-User-UserAllocate-0_0_0-0)

```curl
curl -X POST -d "" https://habitica.com/api/v3/user/allocate?stat=int
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Returns stats and notifications from the user profile |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| NoPoints | NotAuthorized | You don't have enough Stat Points. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserAllocate-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have enough Stat Points."
}
```

### User | Allocate all Stat Points

Uses the user's chosen automatic allocation method, or if none, assigns all to STR. Note: will return success, even if there are 0 points to allocate.

```http post-method
https://habitica.com/api/v3/user/allocate-now
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.stats |

- [Success-Response:](https://apidoc.habitica.com/#success-examples-User-UserAllocateNow-0_0_0-0)

```json
 {
  "success": true,
  "data": {
    "hp": 50,
    "mp": 38,
    "exp": 7,
    "gp": 284.8637271160258,
    "lvl": 10,
    "class": "rogue",
    "points": 0,
    "str": 2,
    "con": 2,
    "int": 3,
    "per": 3,
    "buffs": {
      "str": 0,
      "int": 0,
      "per": 0,
      "con": 0,
      "stealth": 0,
      "streaks": false,
      "snowball": false,
      "spookySparkles": false,
      "shinySeed": false,
      "seafoam": false
    },
    "training": {
      "int": 0,
      "per": 0,
      "str": 0,
      "con": 0
    },
    "notifications": [ .... ],
  }
}
```

### User | Allocate multiple Stat Points

```http post-method
https://habitica.com/api/v3/user/allocate-bulk
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| stats | Object | Body parameter |

- [Example request](https://apidoc.habitica.com/#parameter-examples-User-UserAllocateBulk-0_0_0-0)

```json
{
 stats: {
   "int": int,
   "str": str,
   "con": con,
   "per": per
 }
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Returns stats and notifications from the user profile |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| NoPoints | NotAuthorized | You don't have enough Stat Points. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserAllocateBulk-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have enough Stat Points."
}
```

### User | Block / unblock a user from sending you a PM

```http post-method
https://habitica.com/api/v3/user/block/:uuid
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| uuid | UUID | The uuid of the user to block / unblock |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | user.inbox.blocks |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-BlockUser-0_0_0-0)

```json
{
    "success": true,
    "data": [
        "e4842579-g987-d2d2-8660-2f79e725fb79"
    ],
    "notifications": []
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| InvalidUUID | BadRequest | UUID is incorrect. |

### User | Buy a health potion

```http post-method
https://habitica.com/api/v3/user/buy-health-potion
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | User's current stats |
| message | String | Success message |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-UserBuyPotion-0_0_0-0)

```json
 {
  "success": true,
  "data": {
    ---DATA TRUNCATED---
  },
  "message": "Bought Health Potion"
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| messageNotEnoughGold | NotAuthorized | Not enough gold for the purchase |
| messageHealthAlreadyMax | NotAuthorized | Health is already full. |

- [NotAuthorized Not enough gold](https://apidoc.habitica.com/#error-examples-User-UserBuyPotion-0_0_0-0)
- [NotAuthorized Already at max health](https://apidoc.habitica.com/#error-examples-User-UserBuyPotion-0_0_0-1)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not Enough Gold"
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You already have maximum health."
}
```

### User | Buy a Mystery Item set

This buys a Mystery Item set using an Hourglass.

```http post-method
https://habitica.com/api/v3/user/buy-mystery-set/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| key | String | The mystery set to buy |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| items | Object | user.items |
| purchasedPlanConsecutive | Object | user.purchased.plan.consecutive |
| message | String | Success message |

- [Successful purchase](https://apidoc.habitica.com/#success-examples-User-UserBuyMysterySet-0_0_0-0)

```json
{
  "success": true,
  "data": {
    ---DATA TRUNCATED---
  },
  "message": "Purchased an item set using a Mystic Hourglass!"
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| notEnoughHourglasses | NotAuthorized | Not enough Mystic Hourglasses. |
| mysterySetNotFound | NotFound | Specified item does not exist or already owned. |

- [Not enough hourglasses](https://apidoc.habitica.com/#error-examples-User-UserBuyMysterySet-0_0_0-0)
- [Already own, or doesn't exist](https://apidoc.habitica.com/#error-examples-User-UserBuyMysterySet-0_0_0-1)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have enough Mystic Hourglasses."
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "Mystery set not found, or set already owned."
}
```

### User | Buy a piece of gear

```http post-method
https://habitica.com/api/v3/user/buy-gear/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| key | String | The item to buy |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| items | Object | User's item inventory |
| flags | Object | User's flags |
| achievements | Object | User's achievements |
| stats | Object | User's current stats |
| message | String | Success message, item purchased |

- [Purchased a warrior's wooden shield for example:](https://apidoc.habitica.com/#success-examples-User-UserBuyGear-0_0_0-0)

```json
{
  "success": true,
  "data": {
    ---TRUNCATED USER RECORD---
  },
  "message": "Bought Wooden Shield"
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| messageNotEnoughGold | NotAuthorized | Not enough gold for the purchase |
| messageAlreadyOwnGear | NotAuthorized | Already own equipment |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| messageNotFound | NotFound | Item does not exist. |

- [NotAuthorized Already own](https://apidoc.habitica.com/#error-examples-User-UserBuyGear-0_0_0-0)
- [NotAuthorized Not enough gold](https://apidoc.habitica.com/#error-examples-User-UserBuyGear-0_0_0-1)
- [NotFound Item not found](https://apidoc.habitica.com/#error-examples-User-UserBuyGear-0_0_0-2)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You already own that piece of equipment"
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not Enough Gold"
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "Item \"weapon_misspelled_1\" not found."
}
```

### User | Buy a quest with gold

```http post-method
https://habitica.com/api/v3/user/buy-quest/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| key | String | The quest scroll to buy |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| quests | Object | User's quest list |
| message | String | Success message |

- [Success response:](https://apidoc.habitica.com/#success-examples-User-UserBuyQuest-0_0_0-0)

```json
{
  "success": true,
  "data": {
    --- DATA TRUNCATED---
  },
  "message": "Bought Dilatory Distress, Part 1: Message in a Bottle"
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| questNotFound | NotFound | Specified quest does not exist |
| messageNotEnoughGold | NotAuthorized | Not enough gold for the purchase |

- [Quest chosen does not exist](https://apidoc.habitica.com/#error-examples-User-UserBuyQuest-0_0_0-0)
- [You must first complete this quest's prerequisites](https://apidoc.habitica.com/#error-examples-User-UserBuyQuest-0_0_0-1)
- [NotAuthorized Not enough gold](https://apidoc.habitica.com/#error-examples-User-UserBuyQuest-0_0_0-2)

```json
{
    "success": false,
    "error": "NotFound",
    "message": "Quest \"dilatoryDistress99\" not found."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You must first complete dilatoryDistress2."
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not Enough Gold"
}
```

### User | Buy an Enchanted Armoire item

```http post-method
https://habitica.com/api/v3/user/buy-armoire
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| items | Object | User's item inventory |
| flags | Object | User's flags |
| armoire | Object | Item given by the armoire |
| message | String | Success message |

- [Received a fish:](https://apidoc.habitica.com/#success-examples-User-UserBuyArmoire-0_0_0-0)

```json
{
 "success": true,
 "data": {
   ---DATA TRUNCATED---
   "armoire": {
     "type": "food",
     "dropKey": "Fish",
     "dropArticle": "a ",
     "dropText": "Fish"
   }
 },
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| messageNotEnoughGold | NotAuthorized | Not enough gold for the purchase |

- [NotAuthorized Not enough gold](https://apidoc.habitica.com/#error-examples-User-UserBuyArmoire-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not Enough Gold"
}
```

### User | Buy gear, armoire or potion

Under the hood uses UserBuyGear, UserBuyPotion and UserBuyArmoire

```http post-method
https://habitica.com/api/v3/user/buy/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| key | String | The item to buy |

#### Success 200

| Field | Description |
| --- | --- |
| data | User's data profile |
| message | Item purchased |

- [Purchased a rogue short sword for example:](https://apidoc.habitica.com/#success-examples-User-UserBuy-0_0_0-0)

```json
{
  "success": true,
  "data": {
    ---TRUNCATED USER RECORD---
  },
  "message": "Bought Short Sword"
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| messageAlreadyOwnGear | NotAuthorized | Already own equipment |
| messageNotEnoughGold | NotAuthorized | Not enough gold for the purchase |

- [NotAuthorized Already own](https://apidoc.habitica.com/#error-examples-User-UserBuy-0_0_0-0)
- [NotAuthorized Not enough gold](https://apidoc.habitica.com/#error-examples-User-UserBuy-0_0_0-1)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You already own that piece of equipment"
}
```

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not Enough Gold"
}
```

### User | Buy special item (card, avatar transformation)

Includes gift cards (e.g., birthday card), and avatar Transformation Items and their antidotes (e.g., Snowball item and Salt reward).

```http post-method
https://habitica.com/api/v3/user/buy-special-spell/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| key | String | The special item to buy. Must be one of the keys from "content.special", such as birthday, snowball, salt. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| stats | Object | User's current stats |
| items | Object | User's current inventory |
| message | String | Success message |

- [Purchased a greeting card:](https://apidoc.habitica.com/#success-examples-User-UserBuySpecialSpell-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "message": "Bought Greeting Card"
}
```

#### 400

| Name | Type | Description |
| --- | --- | --- |
| messageNotEnoughGold | NotAuthorized | Not enough gold for the purchase |

- [Not enough gold](https://apidoc.habitica.com/#error-examples-User-UserBuySpecialSpell-0_0_0-0)
- [Item name not found](https://apidoc.habitica.com/#error-examples-User-UserBuySpecialSpell-0_0_0-1)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not Enough Gold"
}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "Skill \"happymardigras\" not found."
}
```

### User | Cast a skill (spell) on a target

Skill Key to Name Mapping

Mage: fireball="Burst of Flames", mpheal="Ethereal Surge", earth="Earthquake", frost="Chilling Frost"

Warrior: smash="Brutal Smash", defensiveStance="Defensive Stance", valorousPresence="Valorous Presence", intimidate="Intimidating Gaze"

Rogue: pickPocket="Pickpocket", backStab="Backstab", toolsOfTrade="Tools of the Trade", stealth="Stealth"

Healer: heal="Healing Light", protectAura="Protective Aura", brightness="Searing Brightness", healAll="Blessing"

Transformation Items: snowball="Snowball", spookySparkles="Spooky Sparkles", seafoam="Seafoam", shinySeed="Shiny Seed"

```http post-method
https://habitica.com/api/v3/user/class/cast/:spellId
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| spellId | String | The skill to cast.<br><br>Allowed values: `fireball`, `mpheal`, `earth`, `frost`, `smash`, `defensiveStance`, `valorousPresence`, `intimidate`, `pickPocket`, `backStab`, `toolsOfTrade`, `stealth`, `heal`, `protectAura`, `brightness`, `healAll`, `snowball`, `spookySparkles`, `seafoam`, `shinySeed` |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| targetId | UUID | Query parameter, necessary if the spell is cast on a party member or task. Not used if the spell is casted on the user or the user's current party. |

- [Query example:](https://apidoc.habitica.com/#parameter-examples-User-UserCast-0_0_0-0)

```json
Cast "Pickpocket" on a task:
 https://habitica.com/api/v3/user/class/cast/pickPocket?targetId=fd427623...

Cast "Tools of the Trade" on the party:
 https://habitica.com/api/v3/user/class/cast/toolsOfTrade
```

#### Success 200

| Field | Description |
| --- | --- |
| data | Will return the modified targets. For party members only the necessary fields will be populated. The user is always returned. |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| Not | NotAuthorized | enough mana. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |
| PartyNotFound | NotFound | The user's party could not be found. |
| UserNotFound | NotFound | The specified user could not be found. |

### User | Change class

User must be at least level 10. If ?class is defined and user.flags.classSelected is false it'll change the class. If user.preferences.disableClasses it'll enable classes, otherwise it sets user.flags.classSelected to false (costs 3 gems).

```http post-method
https://habitica.com/api/v3/user/change-class
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| class | String | Query parameter - ?class={warrior\|rogue\|wizard\|healer} |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| flags | Object | user.flags |
| stats | Object | user.stats |
| preferences | Object | user.preferences |
| items | Object | user.items |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Gems | NotAuthorized | Not enough gems, if class was already selected and gems needed to be paid. |
| Level | NotAuthorized | To change class you must be at least level 10. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserChangeClass-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not enough Gems"
}
```

### User | Check if email is used

Check if the email is already used by another user

```http put-method
https://habitica.com/api/v4/user/auth/check-email
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| email | String | The checked email address. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| email | String | The checked email address |
| valid | Boolean | True if available, false if in use |

### User | Delete a message

```http delete-method
https://habitica.com/api/v3/user/messages/:id
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| id  | UUID | The id of the message to delete |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.inbox.messages |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-deleteMessage-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "74d9a2e7-4c6e-4f3b-c3c4-517873f41592": {
            "sort": 0,
            "user": "MadPink",
            "backer": {},
            "contributor": {},
            "uuid": "b0413351-405f-416f-9999-947ec1c85199",
            "flagCount": 0,
            "flags": {},
            "likes": {},
            "timestamp": 1487276826704,
            "text": "Hi there!",
            "id": "74d9a2e7-4c6e-4f3b-c3c4-517873f41592"
        }
    }
}
```

### User | Delete all messages

```http delete-method
https://habitica.com/api/v3/user/messages
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.inbox.messages which should be empty |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-clearMessages-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "notifications": []
}
```

### User | Delete an authenticated user's account

```http delete-method
https://habitica.com/api/v3/user
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| password | String | The user's password if the account uses local authentication, otherwise the localized word "DELETE" |
| feedback | String | User's optional feedback explaining reasons for deletion |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |

- [Result:](https://apidoc.habitica.com/#success-examples-User-UserDelete-0_0_0-0)

```json
{
    "success": true,
    "data": {}
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| MissingPassword | BadRequest | Missing password. |
| NotAuthorized | BadRequest | Wrong password. |
| BadRequest | BadRequest | Account deletion feedback is limited to 10,000 characters. For lengthy feedback, email ${TECH\_ASSISTANCE\_EMAIL}. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserDelete-0_0_0-0)

```json
{
    "success": false,
    "error": "BadRequest",
    "message": "Invalid request parameters.",
    "errors": [
        {
            "message": "Missing password.",
            "param": "password"
        }
    ]
}
```

### User | Delete social authentication method

Remove a social authentication method from a user profile. The user must have another authentication method enabled.

```http delete-method
https://habitica.com/api/v3/user/auth/social/:network
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Empty object |

### User | Disable classes

```http post-method
https://habitica.com/api/v3/user/disable-classes
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| flags | Object | user.flags |
| stats | Object | user.stats |
| preferences | Object | user.preferences |

### User | Equip or unequip an item

```http post-method
https://habitica.com/api/v3/user/equip/:type/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| type | String | The type of item to equip or unequip.<br><br>Allowed values: `"mount"`, `"pet"`, `"costume"`, `"equipped"` |
| key | String | The item to equip or unequip |

- [Example-URL](https://apidoc.habitica.com/#parameter-examples-User-UserEquip-0_0_0-0)

```url
https://habitica.com/api/v3/user/equip/equipped/weapon_warrior_2
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.items |
| message | String | Optional success message for unequipping an items |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-UserEquip-0_0_0-0)

```json
 {
  "success": true,
  "data": {---DATA TRUNCATED---},
  "message": "Training Sword unequipped."
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| notOwned | NotFound | Item is not in inventory, item doesn't exist, or item is of the wrong type. |

- [Item not owned or doesn't exist.](https://apidoc.habitica.com/#error-examples-User-UserEquip-0_0_0-0)

```json
{"success":false,"error":"NotFound","message":"You do not own this item."}
{"success":false,"error":"NotFound","message":"You do not own this pet."}
{"success":false,"error":"NotFound","message":"You do not own this mount."}
```

### User | Feed a pet

```http post-method
https://habitica.com/api/v3/user/feed/:pet/:food
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| pet | String |     |
| food | String |     |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| amount optional | Number | The amount of food to feed. Note: Pet can eat 50 units. Preferred food offers 5 units per food, other food 2 units. |

- [Example-URL](https://apidoc.habitica.com/#parameter-examples-User-UserFeed-0_0_0-0)

```url
https://habitica.com/api/v3/user/feed/Armadillo-Shade/Chocolate
https://habitica.com/api/v3/user/feed/Armadillo-Shade/Chocolate?amount=9
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Number | The pet value |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserFeed-0_0_0-0)

```json
{"success":true,"data":10,"message":"Shade Armadillo
really likes the Chocolate!","notifications":[]}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| PetNotOwned | NotFound | :pet not found in user.items.pets |
| InvalidPet | BadRequest | Invalid pet name supplied. |
| FoodNotOwned | NotFound | :food not found in user.items.food Note: also sent if food name is invalid. |
| notEnoughFood | NotAuthorized | :Not enough food to feed the pet as requested. |
| tooMuchFood | NotAuthorized | :You try to feed too much food. Action ancelled. |

### User | Get anonymized user data

Returns the user's data without: Authentication information, NewMessages/Invitations/Inbox, Profile, Purchased information, Contributor information, Special items, Webhooks, Notifications.

```http get-method
https://habitica.com/api/v3/user/anonymized
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| user | Object |     |
| tasks | Object |     |

### User | Get equipment/gear items available for purchase for the authenticated user

```http get-method
https://habitica.com/api/v3/user/inventory/buy
```

- [Success-Response:](https://apidoc.habitica.com/#success-examples-User-UserGetBuyList-0_0_0-0)

```json
{
    "success": true,
    "data": [
        {
            "text": "Training Sword",
            "notes": "Practice weapon. Confers no benefit.",
            "value": 1,
            "type": "weapon",
            "key": "weapon_warrior_0",
            "set": "warrior-0",
            "klass": "warrior",
            "index": "0",
            "str": 0,
            "int": 0,
            "per": 0,
            "con": 0
        }
    ]
}
```

### User | Get the authenticated user's profile

The user profile contains data related to the authenticated user including (but not limited to): Achievements; Authentications (including types and timestamps); Challenges memberships (Challenge IDs); Flags (including armoire, tutorial, tour etc...); Guilds memberships (Guild IDs); History (including timestamps and values, only for Experience and summed To Do values); Inbox; Invitations (to parties/guilds); Items (character's full inventory); New Messages (flags for party/guilds that have new messages; also reported in Notifications); Notifications; Party (includes current quest information); Preferences (user selected prefs); Profile (name, photo url, blurb); Purchased (includes subscription data and some gem-purchased items); PushDevices (identifiers for mobile devices authorized); Stats (standard RPG stats, class, buffs, xp, etc..); Tags; TasksOrder (list of all IDs for Dailys, Habits, Rewards and To Do's).

```http get-method
https://habitica.com/api/v3/user
```

- [Example use:](https://apidoc.habitica.com/#examples-User-UserGet-0_0_0-0)

```curl
curl -i https://habitica.com/api/v3/user?userFields=achievements,items.mounts
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| userFields optional | String | A list of comma-separated user fields to be returned instead of the entire document. Notifications are always returned. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The user object |

- [Result:](https://apidoc.habitica.com/#success-examples-User-UserGet-0_0_0-0)

```json
 {
  "success": true,
  "data": {
  --  User data included here, for details of the user model see:
  --  https://github.com/HabitRPG/habitica/tree/develop/website/server/models/user
  }
}
```

### User | Get the in app items appearing in the user's reward column

```http get-method
https://habitica.com/api/v3/user/in-app-rewards
```

- [Success-Response:](https://apidoc.habitica.com/#success-examples-User-UserGetInAppRewards-0_0_0-0)

```json
{
  "success": true,
  "data": [
    {
      "key":"weapon_armoire_battleAxe",
      "text":"Battle Axe",
      "notes":"This fine iron axe is well-suited to battling your fiercest
              foes or your most difficult tasks. Increases Intelligence by 6 and
              Constitution by 8. Enchanted Armoire: Independent Item.",
      "value":1,
      "type":"weapon",
      "locked":false,
      "currency":"gems",
      "purchaseType":"gear",
      "class":"shop_weapon_armoire_battleAxe",
      "path":"gear.flat.weapon_armoire_battleAxe",
      "pinType":"gear"
    }
  ]
}
```

### User | Get users purchase history

```http get-method
https://habitica.com/api/v4/user/purchase-history
```

### User | Hatch a pet

```http post-method
https://habitica.com/api/v3/user/hatch/:egg/:hatchingPotion
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| egg | String | The egg to use |
| hatchingPotion | String | The hatching potion to use |

- [Example-URL](https://apidoc.habitica.com/#parameter-examples-User-UserHatch-0_0_0-0)

```url
https://habitica.com/api/v3/user/hatch/Dragon/CottonCandyPink
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.items |
| message | String |     |

- [Successfully hatched](https://apidoc.habitica.com/#success-examples-User-UserHatch-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "message": "Your egg hatched! Visit your stable to equip your pet."
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| messageAlreadyPet | NotAuthorized | Already have the specific pet combination |
| messageMissingEggPotion | NotFound | One or both of the ingredients are missing. |
| messageInvalidEggPotionCombo | NotFound | Cannot use that combination of egg and potion. |

- [Already have that pet.](https://apidoc.habitica.com/#error-examples-User-UserHatch-0_0_0-0)
- [Either potion or egg (or both) not in inventory](https://apidoc.habitica.com/#error-examples-User-UserHatch-0_0_0-1)
- [Cannot use that combination](https://apidoc.habitica.com/#error-examples-User-UserHatch-0_0_0-2)

```json
{"success":false,"error":"NotAuthorized","message":"You already have that pet.
Try hatching a different combination"}
```

```json
{
    "success": false,
    "error": "NotFound",
    "message": "You're missing either that egg or that potion"
}
```

```json
{"success":false,"error":"NotAuthorized","message":"You can't hatch Quest
Pet Eggs with Magic Hatching Potions! Try a different egg."}
```

### User | Login

Login a user with email / username and password

```http post-method
https://habitica.com/api/v3/user/auth/local/login
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| username | String | Username or email of the user |
| password | String | The user's password |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| \_id | String | The user's unique identifier |
| apiToken | String | The user's api token that must be used to authenticate requests. |
| newUser | Boolean | Returns true if the user was just created (always false for local login). |

### User | Make the user start / stop sleeping (resting in the Inn)

Toggles the sleep key under user preference true and false.

```http post-method
https://habitica.com/api/v3/user/sleep
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | boolean | user.preferences.sleep |

- [Return-example](https://apidoc.habitica.com/#success-examples-User-UserSleep-0_0_0-0)

```json
{
    "success": true,
    "data": false
}
```

### User | Mark Private Messages as read

```http post-method
https://habitica.com/api/v3/user/mark-pms-read
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.inbox.newMessages |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-markPmsRead-0_0_0-0)

```json
{
    "success": true,
    "data": [
        0,
        "Your private messages have been marked as read"
    ],
    "notifications": []
}
```

### User | Move a pinned item in the rewards column to a new position after being sorted

```http post-method
https://habitica.com/api/v3/user/move-pinned-item/:type/:path/move/to/:position
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| path | String | The unique item path used for pinning |
| position | Number | Where to move the task. 0 = top of the list ("push to top"). -1 = bottom of the list ("push to bottom"). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | The new pinned items order. |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-MovePinnedItem-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "path": "quests.mayhemMistiflying3",
        "type": "quests",
        "_id": "5a32d357232feb3bc94c2bdf"
    },
    "notifications": []
}
```

#### 404

| Name | Type | Description |
| --- | --- | --- |
| TaskNotFound | NotFound | The specified task could not be found. |

### User | Open the Mystery Item box

```http post-method
https://habitica.com/api/v3/user/open-mystery-item
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The item obtained |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserOpenMysteryItem-0_0_0-0)

```json
{ "success": true,
  "data": {
    "mystery": "201612",
    "value": 0,
    "type": "armor",
    "key": "armor_mystery_201612",
    "set": "mystery-201612",
    "klass": "mystery",
    "index": "201612",
    "str": 0,
    "int": 0,
    "per": 0,
    "con": 0
  },
  "message": "Mystery item opened."
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Empty | BadRequest | No mystery items to open. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserOpenMysteryItem-0_0_0-0)

```json
{
    "success": false,
    "error": "BadRequest",
    "message": "Mystery items are empty"
}
```

### User | Purchase Gem or Gem-purchasable item

```http post-method
https://habitica.com/api/v3/user/purchase/:type/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| type | String | Type of item to purchase.<br><br>Allowed values: `"gems"`, `"eggs"`, `"hatchingPotions"`, `"premiumHatchingPotions"`, `"food"`, `"quests"`, `"gear"`, `"pets"` |
| key | String | Item's key (use "gem" for purchasing gems) |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| quantity optional | Integer | Count of items to buy. Defaults to 1 and is ignored for items where quantity is irrelevant.<br><br>Default value: `1` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| items | Object | user.items |
| balance | Number | user.balance |
| message | String | Success message |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| NotAvailable | NotAuthorized | Item is not available to be purchased (not unlocked for the user). |
| Gems | NotAuthorized | Not enough gems |
| Key | NotFound | Key not found for Content type. |
| Type | NotFound | Type invalid. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserPurchase-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "This item is not currently available for purchase."
}
```

### User | Purchase Hourglass-purchasable item

Purchases an Hourglass-purchasable item. Does not include Mystery Item sets (use /api/v3/user/buy-mystery-set/:key).

```http post-method
https://habitica.com/api/v3/user/purchase-hourglass/:type/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| type | String | The type of item to purchase<br><br>Allowed values: `"pets"`, `"mounts"` |
| key | String | Ex: {Phoenix-Base}. The key for the mount/pet |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| quantity optional | Integer | Count of items to buy. Defaults to 1 and is ignored for items where quantity is irrelevant.<br><br>Default value: `1` |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| items | Object | user.items |
| purchasedPlanConsecutive | Object | user.purchased.plan.consecutive |
| message | String | Success message |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| NotAvailable | NotAuthorized | Item is not available to be purchased or is not valid. |
| Hourglasses | NotAuthorized | User does not have enough Mystic Hourglasses. |
| Quantity | BadRequest | Quantity to purchase must be a number. |
| Type | NotFound | Type invalid. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserPurchaseHourglass-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "You don't have enough Mystic Hourglasses."
}
```

### User | Read a card

```http post-method
https://habitica.com/api/v3/user/read-card/:cardType
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| cardType | String | Type of card to read (e.g. - birthday, greeting, nye, thankyou, valentine). |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| specialItems | Object | user.items.special |
| cardReceived | Boolean | user.flags.cardReceived |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserReadCard-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "specialItems": {
            "snowball": 0,
            "spookySparkles": 0,
            "shinySeed": 0,
            "seafoam": 0,
            "valentine": 0,
            "valentineReceived": [],
            "nye": 0,
            "nyeReceived": [],
            "greeting": 0,
            "greetingReceived": [
                "MadPink"
            ],
            "thankyou": 0,
            "thankyouReceived": [],
            "birthday": 0,
            "birthdayReceived": []
        },
        "cardReceived": false
    },
    "message": "valentine has been read"
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| CardType | NotAuthorized | Unknown card type. |

### User | Register

Register a new user with email, login name, and password or attach local authentication to a social auth user

```http post-method
https://habitica.com/api/v3/user/auth/local/register
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| username | String | Login name of the new user. Must be 1-36 characters, containing only a-z, 0-9, hyphens (-), or underscores (\_). |
| email | String | Email address of the new user |
| password | String | Password for the new user |
| confirmPassword | String | Password confirmation |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The user object, if local auth was just attached to a social user then only user.auth.local |

### User | Release mounts

```http post-method
https://habitica.com/api/v3/user/release-mounts
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.items.mounts |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserReleaseMounts-0_0_0-0)

```json
 {
  "success": true,
  "data": {
    },
    "items": {}
  },
  "message": "Mounts released"
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Gems | NotAuthorized | Not enough gems |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserReleaseMounts-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not enough Gems"
}
```

### User | Release pets and mounts and grants Triad Bingo

```http post-method
https://habitica.com/api/v3/user/release-both
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| achievements | Object |     |
| items | Object |     |
| balance | Number |     |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserReleaseBoth-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "achievements": {
            "ultimateGearSets": {},
            "challenges": [],
            "quests": {},
            "perfect": 0,
            "beastMaster": true,
            "beastMasterCount": 1,
            "mountMasterCount": 1,
            "triadBingoCount": 1,
            "mountMaster": true,
            "triadBingo": true
        },
        "items": {}
    },
    "message": "Mounts and pets released"
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Gems | NotAuthorized | Not enough gems |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserReleaseBoth-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not enough Gems"
}
```

### User | Request a refresh of user stats, including processing of pending level-ups

```http post-method
https://habitica.com/api/v3/user/stat-sync
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The user object |

### User | Reroll a user (reset tasks) using the Fortify Potion

```http post-method
https://habitica.com/api/v3/user/reroll
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| user | Object |     |
| tasks | Object | User's modified tasks (no rewards) |
| message | Object | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserReroll-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "message": "Fortify complete!"
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Gems | NotAuthorized | Not enough gems |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserReroll-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not enough Gems"
}
```

### User | Reset password (email a reset link)

Send the user an email to let them reset their password

```http post-method
https://habitica.com/api/v3/user/reset-password
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| email | String | The email address of the user |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| message | String | The localized success message |

### User | Reset password (set a new one)

Set a new password for a user that reset theirs. Not meant for public usage.

```http post-method
https://habitica.com/api/v3/user/auth/reset-password-set-new-one
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| newPassword | String | The new password. |
| confirmPassword | String | Password confirmation. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | String | An empty object |

### User | Reset user

```http post-method
https://habitica.com/api/v3/user/reset
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| user | Object |     |
| tasksToRemove | Array | IDs of removed tasks |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserReset-0_0_0-0)

```json
 {
  "success": true,
  "data": {--TRUNCATED--},
    "tasksToRemove": [
      "ebb8748c-0565-431e-9036-b908da25c6b4",
      "12a1cecf-68eb-40a7-b282-4f388c32124c"
    ]
  },
  "message": "Reset complete!"
}
```

### User | Revive user from death

```http post-method
https://habitica.com/api/v3/user/revive
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.items |
| message | String | Success message |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| NotDead | NotAuthorized | Cannot revive player if player is not dead yet |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserRevive-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Cannot revive if not dead"
}
```

### User | Sell a gold-sellable item owned by the user

```http post-method
https://habitica.com/api/v3/user/sell/:type/:key
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| type | String | The type of item to sell.<br><br>Allowed values: `"eggs"`, `"hatchingPotions"`, `"food"` |
| key | String | The key of the item |

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| amount optional | Number | The amount to sell |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| stats | Object |     |
| items | Object |     |

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| InvalidKey | NotFound | Key not found for user.items eggs (either the key does not exist or the user has none in inventory). |
| InvalidType | NotAuthorized | Type is not a valid type. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserSell-0_0_0-0)

```json
{"success":false,"error":"NotAuthorized","message":"Type is not sellable.
Must be one of the following eggs, hatchingPotions, food"}
```

### User | Set Custom Day Start time for user

```http post-method
https://habitica.com/api/v3/user/custom-day-start
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| dayStart optional | number | The hour number 0-23 for day to begin. If not supplied, will default to 0.<br><br>Default value: `0` |

- [Request-Example:](https://apidoc.habitica.com/#parameter-examples-User-setCustomDayStart-0_0_0-0)

```json
{
    "dayStart": 2
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | An empty Object |
| message | String | Success message |

- [Success-Example:](https://apidoc.habitica.com/#success-examples-User-setCustomDayStart-0_0_0-0)

```json
{
    "success": true,
    "data": {
        "message": "Your custom day start has changed."
    },
    "notifications": []
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Validation | BadRequest | Value provided is not a number, or is outside the range of 0-23 |

- [Error-Example:](https://apidoc.habitica.com/#error-examples-User-setCustomDayStart-0_0_0-0)

```json
{
    "success": false,
    "error": "BadRequest",
    "message": "User validation failed",
    "errors": [
        {
            "message": "Path `preferences.dayStart` (25) is more than maximum allowed value (23).",
            "path": "preferences.dayStart",
            "value": 25
        }
    ]
}
```

### User | Toggle an item to be pinned

```http get-method
https://habitica.com/user/toggle-pinned-item/:key
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | Pinned items array |

- [Result:](https://apidoc.habitica.com/#success-examples-User-togglePinnedItem-0_0_0-0)

```json
 {
  "success": true,
  "data": {
    "pinnedItems": [
       "type": "gear",
       "path": "gear.flat.weapon_1"
    ]
  }
}
```

### User | Unequip all items by type

```http post-method
https://habitica.com/api/v4/user/unequip/:type
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| type | String | The type of items to unequip.<br><br>Allowed values: `"pet-mount-background"`, `"costume"`, `"equipped"` |

- [Example-URL](https://apidoc.habitica.com/#parameter-examples-User-UserUnEquipByType-0_0_0-0)

```url
https://habitica.com/api/v4/user/unequip/equipped
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | user.items |
| message | String | Optional success message for unequipping an items |

- [Example return:](https://apidoc.habitica.com/#success-examples-User-UserUnEquipByType-0_0_0-0)

```json
 {
  "success": true,
  "data": {---DATA TRUNCATED---},
  "message": "Battle Gear unequipped.
}
```

### User | Unlock item or set of items by purchase

```http post-method
https://habitica.com/api/v3/user/unlock
```

#### Query Parameters

| Field | Type | Description |
| --- | --- | --- |
| path | String | Full path to unlock. See "content" API call for list of items. |

- [Example call:](https://apidoc.habitica.com/#parameter-examples-User-UserUnlock-0_0_0-0)

```curl
curl -X POST https://habitica.com/api/v3/user/unlock?path=background.midnight_clouds
curl -X POST https://habitica.com/api/v3/user/unlock?path=hair.color.midnight
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| purchased | Object |     |
| items | Object |     |
| preferences | Object |     |
| message | String | "Items have been unlocked" |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserUnlock-0_0_0-0)

```json
{
    "success": true,
    "data": {},
    "message": "Items have been unlocked"
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Path | BadRequest | Path to unlock not specified |
| Gems | NotAuthorized | Not enough gems available. |
| Unlocked | NotAuthorized | Full set already unlocked. |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserUnlock-0_0_0-0)

```json
{"success":false,"error":"BadRequest","message":"Path string is required"}
{"success":false,"error":"NotAuthorized","message":"Full set already unlocked."}
```

### User | Update email

Change the user email address

```http put-method
https://habitica.com/api/v3/user/auth/update-email
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| newEmail | String | The new email address. |
| password | String | The user password. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| email | String | The updated email address |

### User | Update password

Update the password of a local user

```http put-method
https://habitica.com/api/v3/user/auth/update-password
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| password | String | The old password |
| newPassword | String | The new password |
| confirmPassword | String | New password confirmation |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| apiToken | String | The new apiToken |

### User | Update the user

Some of the user items can be updated, such as preferences, flags and stats. ^

```http put-method
https://habitica.com/api/v3/user
```

- [Request-Example:](https://apidoc.habitica.com/#parameter-examples-User-UserUpdate-0_0_0-0)

```json
{
    "achievements.habitBirthdays": 2,
    "profile.name": "MadPink",
    "stats.hp": 53,
    "flags.warnedLowHealth": false,
    "preferences.allocationMode": "flat",
    "preferences.hair.bangs": 3
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated user object, the result is identical to the get user call |

#### 401

| Name | Type | Description |
| --- | --- | --- |
| messageUserOperationProtected | NotAuthorized | Returned if the change is not allowed. |

- [Error-Response:](https://apidoc.habitica.com/#error-examples-User-UserUpdate-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "path `stats.class` was not saved, as it's a protected path."
}
```

### User | Update username

Update and verify the user's username

```http put-method
https://habitica.com/api/v3/user/auth/update-username
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| username | String | The new username |
| password | String | The user's password if they use local authentication. Omit if they use social auth. |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| username | String | The new username |

### User | Use Orb of Rebirth on user

```http post-method
https://habitica.com/api/v3/user/rebirth
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| user | Object |     |
| tasks | Array | User's modified tasks (no rewards) |
| message | String | Success message |

- [Example success:](https://apidoc.habitica.com/#success-examples-User-UserRebirth-0_0_0-0)

```json
 {
  "success": true,
  "data": {
  },
  "message": "You have been reborn!"
    {
      "type": "REBIRTH_ACHIEVEMENT",
      "data": {},
      "id": "424d69fa-3a6d-47db-96a4-6db42ed77a43"
    }
  ]
}
```

#### Error 4xx

| Name | Type | Description |
| --- | --- | --- |
| Gems | NotAuthorized | Not enough gems |

- [Example error:](https://apidoc.habitica.com/#error-examples-User-UserRebirth-0_0_0-0)

```json
{
    "success": false,
    "error": "NotAuthorized",
    "message": "Not enough Gems"
}
```

## Webhook

Webhooks fire when a particular action is performed, such as updating a task, or sending a message in a group.

Your user's configured webhooks are stored as an `Array` on the user object under the `webhooks` property.

### Webhook | Create a new webhook - BETA

```http post-method
https://habitica.com/api/v3/user/webhook
```

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| id optional | UUID | The webhook's id<br><br>Default value: `Randomly Generated UUID` |
| url | String | The webhook's URL |
| label optional | String | A label to remind you what this webhook does |
| enabled optional | Boolean | If the webhook should be enabled<br><br>Default value: `true` |
| type optional | String | The webhook's type.<br><br>Default value: `taskActivity`<br><br>Allowed values: `"taskActivity"`, `"groupChatReceived"`, `"userActivity"`, `"questActivity"` |
| options optional | Object | The webhook's options. Will differ depending on type. Required for `groupChatReceived` type. If a webhook supports options, the default values are displayed in the examples below |

- [Task Activity Example](https://apidoc.habitica.com/#parameter-examples-Webhook-AddWebhook-0_0_0-0)
- [Group Chat Received Example](https://apidoc.habitica.com/#parameter-examples-Webhook-AddWebhook-0_0_0-1)
- [User Activity Example](https://apidoc.habitica.com/#parameter-examples-Webhook-AddWebhook-0_0_0-2)
- [Quest Activity Example](https://apidoc.habitica.com/#parameter-examples-Webhook-AddWebhook-0_0_0-3)
- [Minimal Example](https://apidoc.habitica.com/#parameter-examples-Webhook-AddWebhook-0_0_0-4)

```json
{
  "enabled": true, // default
  "url": "https://some-webhook-url.com",
  "label": "My Webhook",
  "type": "taskActivity", // default
  "options": {
    "created": false, // default
    "updated": false, // default
    "deleted": false, // default
    "scored": true // default
  }
}
```

```json
{
    "enabled": true,
    "url": "https://some-webhook-url.com",
    "label": "My Chat Webhook",
    "type": "groupChatReceived",
    "options": {
        "groupId": "required-uuid-of-group"
    }
}
```

```json
{
  "enabled": true,
  "url": "https://some-webhook-url.com",
  "label": "My Activity Webhook",
  "type": "userActivity",
  "options": { // set at least one to true
    "petHatched": false,  // default
    "mountRaised": false, // default
    "leveledUp": false,   // default
  }
}
```

```json
{
  "enabled": true,
  "url": "https://some-webhook-url.com",
  "label": "My Quest Webhook",
  "type": "questActivity",
  "options": { // set at least one to true
    "questStarted": false,  // default
    "questFinished": false, // default
    "questInvited": false,  // default
  }
}
```

```json
{
    "url": "https://some-webhook-url.com"
}
```

#### 201

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The created webhook |
| id  | UUID | The uuid of the webhook |
| url | String | The url of the webhook |
| label | String | A label for you to keep track of what this webhooks is for |
| enabled | Boolean | Whether the webhook should be sent |
| type | String | The type of the webhook |
| options | Object | The options for the webhook (See examples) |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| WebhookBodyInvalid | BadRequest | A body parameter passed in the request did not pass validation. |

### Webhook | Delete a webhook - BETA

```http delete-method
https://habitica.com/api/v3/user/webhook/:id
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| id  | UUID | The id of the webhook to delete |

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | The remaining webhooks for the user |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| WebhookNotFound | NotFound | The specified webhook could not be found. |

### Webhook | Edit a webhook - BETA

Can change `url`, `enabled`, `type`, and `options` properties. Cannot change `id`.

```http put-method
https://habitica.com/api/v3/user/webhook/:id
```

#### Path Parameters

| Field | Type | Description |
| --- | --- | --- |
| id  | UUID | URL parameter - The id of the webhook to update |

#### Body Parameters

| Field | Type | Description |
| --- | --- | --- |
| url optional | String | The webhook's URL |
| label optional | String | A label to remind you what this webhook does |
| enabled optional | Boolean | If the webhook should be enabled |
| type optional | String | The webhook's type.<br><br>Allowed values: `"taskActivity"`, `"groupChatReceived"`, `"userActivity"`, `"questActivity"` |
| options optional | Object | The webhook's options. Will differ depending on type. The options are enumerated in the [add webhook examples](https://apidoc.habitica.com/#api-Webhook-UserAddWebhook). |

- [Update Enabled and Type Properties](https://apidoc.habitica.com/#parameter-examples-Webhook-UserUpdateWebhook-0_0_0-0)
- [Update Group Id for Group Chat Receieved Webhook](https://apidoc.habitica.com/#parameter-examples-Webhook-UserUpdateWebhook-0_0_0-1)

```json
{
    "enabled": false,
    "type": "taskActivity"
}
```

```json
{
    "options": {
        "groupId": "new-uuid-of-group"
    }
}
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Object | The updated webhook |
| id  | UUID | The uuid of the webhook |
| url | String | The url of the webhook |
| label | String | A label for you to keep track of what this webhooks is for |
| enabled | Boolean | Whether the webhook should be sent |
| type | String | The type of the webhook |
| options | Object | The options for the webhook (See webhook add examples) |

#### 400

| Name | Type | Description |
| --- | --- | --- |
| WebhookBodyInvalid | BadRequest | A body parameter passed in the request did not pass validation. |

#### 404

| Name | Type | Description |
| --- | --- | --- |
| WebhookNotFound | NotFound | The specified webhook could not be found. |

### Webhook | Get webhooks

```http get-method
https://habitica.com/api/v3/user/webhook
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| data | Array | User's webhooks |

## WorldState

### WorldState | Get the state for the game world

Does not require authentication.

```http get-method
https://habitica.com/api/v3/world-state
```

#### Success 200

| Field | Type | Description |
| --- | --- | --- |
| worldBoss.active | Object | Boolean, true if world boss quest is underway |
| worldBoss.extra.worldDmg | Object | Object with NPC names as Boolean properties, true if they are affected by Rage Strike. |
| worldBoss.key | Object | String, Quest content key for the world boss |
| worldBoss.progress.hp | Object | Number, Current Health of the world boss |
| worldBoss.progress.rage | Object | Number, Current Rage of the world boss |
| npcImageSuffix | Object | String, trailing component of NPC image filenames |
| currentEvent | Object | The current active event |

## i18n

### i18n | Returns the i18n js script

Returns the i18n js script to make all the i18n strings available in the browser under window.i18n.strings. Does not require authentication.

```http get-method
https://habitica.com/api/v3/i18n/core
```

### i18n | Returns the i18n js script

Returns the i18n js script to make all the i18n strings available in the browser under window.i18n.strings. Does not require authentication.

```http get-method
https://habitica.com/api/v3/i18n/content
```
