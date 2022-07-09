import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{
  Route.post('createReport', 'Feed/FeedController.createReport')
  Route.post('createFeed', 'Feed/FeedController.createFeed')
  Route.get('getFeed', 'Feed/FeedController.getFeed')
  Route.get('getAdds', 'Feed/FeedController.getAdds')
  Route.post('saveFeedforUser', 'Feed/FeedController.saveFeedforUser')
  Route.post('unsaveFeedforUser', 'Feed/FeedController.unsaveFeedforUser')
  Route.post('createLike', 'Feed/FeedController.createLike')
  Route.post('getLinkPreview', 'Feed/FeedController.getLinkPreview')
  Route.post('uploadImage', 'Feed/FeedController.uploadImage')
  Route.get('getSingleFeed/:id', 'Feed/FeedController.getSingleFeed')
  Route.post('updateFeed', 'Feed/FeedController.updateFeed')
  Route.post('deleteFeed', 'Feed/FeedController.deleteFeed')
  Route.post('hidePost', 'Feed/FeedController.hidePost')
  Route.get('getPageNotFollow', 'Feed/FeedController.getPageNotFollow')
  Route.get('getStoryFeed', 'Feed/FeedController.getStoryFeed')
  Route.get('getStoryFeedDetails/:id', 'Feed/FeedController.getStoryFeedDetails')
  Route.get('getFellings', 'Feed/FeedController.getFellings')
  Route.get('searchForFeelings', 'Feed/FeedController.searchForFeelings')
  Route.get('searchForSubActivities', 'Feed/FeedController.searchForSubActivities')
  Route.get('getActivities', 'Feed/FeedController.getActivities')
  Route.get('getSubActivities', 'Feed/FeedController.getSubActivities')
  Route.get('getAllReactionType', 'Feed/FeedController.getAllReactionType')
  Route.get('getReactedPeople', 'Feed/FeedController.getReactedPeople')
  
  // Route.post('deleteStory', 'Feed/FeedController.deleteFeed')
  Route.post('deleteStoryFeed', 'Feed/FeedController.deleteStoryFeed')
  
}).prefix('feed').middleware('auth')


Route.get('gettest', 'Feed/FeedController.gettest')
// Route.get('testAd', 'Feed/FeedController.testAd')

    //App-routes
Route.group(()=>{
  Route.post('createReport', 'Feed/FeedController.createReport')
  Route.post('createFeed', 'Feed/FeedController.createFeed')
  Route.get('getFeed', 'Feed/FeedController.getFeed')
  Route.post('saveFeedforUser', 'Feed/FeedController.saveFeedforUser')
  Route.post('unsaveFeedforUser', 'Feed/FeedController.unsaveFeedforUser')
  Route.post('createLike', 'Feed/FeedController.createLike')
  Route.post('getLinkPreview', 'Feed/FeedController.getLinkPreview')
  Route.post('uploadImage', 'Feed/FeedController.uploadImage')
  Route.get('getSingleFeed/:id', 'Feed/FeedController.getSingleFeed')
  Route.post('updateFeed', 'Feed/FeedController.updateFeed')
  Route.post('hidePost', 'Feed/FeedController.hidePost')
  Route.post('deleteFeed', 'Feed/FeedController.deleteFeed')

  Route.get('getStoryFeed', 'Feed/FeedController.getStoryFeed')
  Route.get('getStoryFeedDetails/:id', 'Feed/FeedController.getStoryFeedDetails')
  Route.get('getAllstoryWithDetails', 'Feed/FeedController.getAllstoryWithDetail')
  Route.get('getReactedPeople', 'Feed/FeedController.getReactedPeople')
  Route.get('getAllReactionType', 'Feed/FeedController.getAllReactionType')
  Route.get('getSubActivities', 'Feed/FeedController.getSubActivities')
  Route.get('getActivities', 'Feed/FeedController.getActivities')
  Route.get('searchForSubActivities', 'Feed/FeedController.searchForSubActivities')
  Route.get('searchForFeelings', 'Feed/FeedController.searchForFeelings')
  Route.get('getFellings', 'Feed/FeedController.getFellings')
  // Route.post('deleteStory', 'Feed/FeedController.deleteStory')
  Route.post('deleteStoryFeed', 'Feed/FeedController.deleteStoryFeed')

}).prefix('app/feed').middleware('auth:api')
