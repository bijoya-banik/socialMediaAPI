import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{
  Route.post('addPollOption', 'PollOption/PollOptionController.addPollOption')
  Route.post('closeOption', 'PollOption/PollOptionController.closeOption')
  // Route.post('addNewOption', 'PollOption/PollOptionController.addNewOption')
}).prefix('polloption').middleware('auth')
    //App-routes
Route.group(()=>{
  Route.post('addPollOption', 'PollOption/PollOptionController.addPollOption')
  Route.post('closeOption', 'PollOption/PollOptionController.closeOption')
}).prefix('app/polloption').middleware('auth:api')
