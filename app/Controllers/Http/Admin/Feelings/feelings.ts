import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{

  Route.get('/getAllFeelings', 'Admin/Feelings/FeelingsController.getAllFeelings')
  Route.post('/createFeelingCategory', 'Admin/Feelings/FeelingsController.createFeelingCategory')

}).prefix('admin-feelings').middleware('admin')
