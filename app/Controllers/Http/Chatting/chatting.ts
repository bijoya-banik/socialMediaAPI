import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
  Route.post('insertChat', 'Chatting/ChattingController.insertChat')
  Route.post('createGroup', 'Chatting/ChattingController.createGroup')
  Route.post('updateGroupInfo', 'Chatting/ChattingController.updateGroupInfo')
  Route.post('getChatLists', 'Chatting/ChattingController.getChatLists')
  Route.post('getAllChatListTillId', 'Chatting/ChattingController.getAllChatListTillId')
  Route.get('getInbox', 'Chatting/ChattingController.getInbox')
  Route.get('getInboxDetails', 'Chatting/ChattingController.getInboxDetails')
  Route.get('getInbox_web', 'Chatting/ChattingController.getInbox_web')
  Route.post('updateSeen', 'Chatting/ChattingController.updateSeen')
  Route.post('deleteSingleMsg', 'Chatting/ChattingController.deleteSingleMsg')
  Route.post('deleteFullConvers', 'Chatting/ChattingController.deleteFullConvers')
  Route.post('deleteGroup', 'Chatting/ChattingController.deleteGroup')
  Route.post('leaveGroup', 'Chatting/ChattingController.leaveGroup')
  Route.post('unSeenMsg', 'Chatting/ChattingController.unSeenMsg')
  Route.post('seenMsg', 'Chatting/ChattingController.seenMsg')
  Route.post('removeAdminRole', 'Chatting/ChattingController.removeAdminRole')
  Route.post('makeAdmin', 'Chatting/ChattingController.makeAdmin')
  Route.post('removeMember', 'Chatting/ChattingController.removeMember')
  Route.post('muteNoti', 'Chatting/ChattingController.muteNoti')
  Route.get('searchForGroupMember', 'Chatting/ChattingController.searchForGroupMember')
  Route.get('getInboxGlobalSearch', 'Chatting/ChattingController.getInboxGlobalSearch')
  Route.post('addNewChatMember', 'Chatting/ChattingController.addNewChatMember')
  Route.post('unmuteNoti', 'Chatting/ChattingController.unmuteNoti')
  Route.get('markAsReadAll', 'Chatting/ChattingController.markAsReadAll')
  Route.get('getInboxByBuddyID', 'Chatting/ChattingController.getInboxByBuddyID')
  Route.get('getInboxRecordById', 'Chatting/ChattingController.getInboxRecordById')
  Route.get('getAllmember', 'Chatting/ChattingController.getAllmember')
  Route.get('getAlladmin', 'Chatting/ChattingController.getAlladmin')
}).prefix('chatting').middleware('auth')


    //App-routes
Route.group(()=>{
  Route.post('updateGroupInfo', 'Chatting/ChattingController.updateGroupInfo')
  Route.post('createGroup', 'Chatting/ChattingController.createGroup')
  Route.post('insertChat', 'Chatting/ChattingController.insertChat')
  Route.post('getAllChatListTillId', 'Chatting/ChattingController.getAllChatListTillId')
  Route.post('getChatLists', 'Chatting/ChattingController.getChatLists')
  Route.get('getInbox_web', 'Chatting/ChattingController.getInbox_web')
  Route.get('getInbox', 'Chatting/ChattingController.getInbox')
  Route.get('getInboxDetails', 'Chatting/ChattingController.getInboxDetails')
  Route.post('updateSeen', 'Chatting/ChattingController.updateSeen')
  Route.post('deleteSingleMsg', 'Chatting/ChattingController.deleteSingleMsg')
  Route.post('deleteGroup', 'Chatting/ChattingController.deleteGroup')
  Route.post('deleteFullConvers', 'Chatting/ChattingController.deleteFullConvers')
  Route.post('leaveGroup', 'Chatting/ChattingController.leaveGroup')
  Route.post('unSeenMsg', 'Chatting/ChattingController.unSeenMsg')
  Route.post('seenMsg', 'Chatting/ChattingController.seenMsg')
  Route.post('removeAdminRole', 'Chatting/ChattingController.removeAdminRole')
  Route.post('makeAdmin', 'Chatting/ChattingController.makeAdmin')
  Route.post('addNewChatMember', 'Chatting/ChattingController.addNewChatMember')
  Route.post('unmuteNoti', 'Chatting/ChattingController.unmuteNoti')
  Route.post('muteNoti', 'Chatting/ChattingController.muteNoti')
  Route.get('getInboxGlobalSearch', 'Chatting/ChattingController.getInboxGlobalSearch')
  Route.get('searchForGroupMember', 'Chatting/ChattingController.searchForGroupMember')
  Route.post('removeMember', 'Chatting/ChattingController.removeMember')
  Route.get('markAsReadAll', 'Chatting/ChattingController.markAsReadAll')
  Route.get('getInboxRecordById', 'Chatting/ChattingController.getInboxRecordById')
  Route.get('getAlladmin', 'Chatting/ChattingController.getAlladmin')
  Route.get('getAllmember', 'Chatting/ChattingController.getAllmember')
  Route.get('getInboxByBuddyID', 'Chatting/ChattingController.getInboxByBuddyID')

}).prefix('app/chatting').middleware('auth:api')
