import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{
  Route.post('addVoteOption', 'VoteOption/VoteOptionController.addVoteOption')
  Route.get('getVotedPeople', 'VoteOption/VoteOptionController.getVotedPeople')
}).prefix('voteoption').middleware('auth')
Route.group(()=>{
  Route.get('getVotedPeople', 'VoteOption/VoteOptionController.getVotedPeople')
  Route.post('addVoteOption', 'VoteOption/VoteOptionController.addVoteOption')
}).prefix('app/voteoption').middleware('auth:api')