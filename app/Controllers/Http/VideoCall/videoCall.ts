import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{
  Route.post('getCallerInformation', 'VideoCall/VideoCallController.getCallerInformation')
  // Route.post('agoraTokenGenerator', 'VideoCall/VideoCallController.agoraTokenGenerator')
}).prefix('videoCall').middleware('auth')


    //App-routes
Route.group(()=>{
  // Route.post('agoraTokenGenerator', 'VideoCall/VideoCallController.agoraTokenGenerator')
  Route.post('getCallerInformation', 'VideoCall/VideoCallController.getCallerInformation')
}).prefix('app/videoCall').middleware('auth:api')
