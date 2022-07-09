import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{
  Route.get('getAllPage', 'Admin/Page/PageController.getAllPage')
  Route.get('getAllCategory', 'Admin/Page/PageController.getAllCategory')
  Route.get('test', 'Admin/Page/PageController.test')
  Route.get('getSinglePage/:id', 'Admin/Page/PageController.getSinglePage')
  Route.post('deletePage', 'Admin/Page/PageController.deletePage')
  Route.post('create_category', 'Admin/Page/PageController.create_category')
  Route.post('update_category', 'Admin/Page/PageController.update_category')
  Route.post('deleteCategory', 'Admin/Page/PageController.deleteCategory')

  //All-countations
  Route.get('allCountations', 'Admin/Page/PageController.allCountations')
  Route.get('staticPages', 'Admin/Page/PageController.staticPages')
  Route.post('editStaticPages', 'Admin/page/PageController.editStaticPages')


}).prefix('admin-page').middleware('admin')
