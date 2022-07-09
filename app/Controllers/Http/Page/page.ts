import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
  Route.get('testPage', 'Page/PageController.getPageByLimit')
  Route.get('getUnfollowPages', 'Page/PageController.getUnfollowPages')
  Route.get('getCategory', 'Page/PageController.getCategory')
  Route.get('getAllPage', 'Page/PageController.getAllPage')
  Route.get('getPageDetails', 'Page/PageController.getPageDetails')
  Route.post('addPage', 'Page/PageController.addPage')
  Route.post('editPage', 'Page/PageController.editPage')
  Route.post('uploadPagePic', 'Page/PageController.uploadPagePic')
  Route.post('followPage', 'Page/PageController.followPage')
  Route.post('ignorePage', 'Page/PageController.ignorePage')
  Route.get('getPageEditDetails', 'Page/PageController.getPageEditDetails')
   Route.post('deletePage', 'Page/PageController.deletePage')


}).prefix('page').middleware('auth')
Route.get('page/getSingleStaticPage/:slug', 'Page/PageController.getSingleStaticPage')
Route.get('page/policies/get/:slug', 'Page/PageController.getPolicyPage')
Route.get('page/terms&condition/get', 'Page/PageController.getTermsAndCondition')


  // Route.post('/page/testing', 'Page/PageController.testing')

    //App-routes
Route.group(()=>{
  Route.get('testPage', 'Page/PageController.getPageByLimit')
  Route.get('getCategory', 'Page/PageController.getCategory')
  Route.get('getAllPage', 'Page/PageController.getAllPage')
  Route.get('getPageDetails', 'Page/PageController.getPageDetails')
  Route.post('addPage', 'Page/PageController.addPage')
  Route.post('editPage', 'Page/PageController.editPage')
  Route.post('uploadPagePic', 'Page/PageController.uploadPagePic')
  Route.post('followPage', 'Page/PageController.followPage')
  Route.get('getPageEditDetails', 'Page/PageController.getPageEditDetails')
   Route.post('deletePage', 'Page/PageController.deletePage')

}).prefix('app/page').middleware('auth:api')
Route.get('app/page/getSingleStaticPage/:slug', 'Page/PageController.getSingleStaticPage')

