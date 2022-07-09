import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{

  Route.get('/getAllCarevanCourse', 'Admin/AdminCourse/AdminCourseController.getAllCarevanCourse')
  Route.get('/getCarevanCourse', 'Admin/AdminCourse/AdminCourseController.getCarevanCourse')
  Route.get('getCarevanCourse/details/:id', 'Admin/AdminCourse/AdminCourseController.getCourseDetailsById')
  Route.post('/createarevanCourse', 'Admin/AdminCourse/AdminCourseController.createarevanCourse')
  Route.post('/editCarevan', 'Admin/AdminCourse/AdminCourseController.editCarevan')
  Route.post('/sortCarevan', 'Admin/AdminCourse/AdminCourseController.sortCarevan')
  Route.post('/editTraining', 'Admin/AdminCourse/AdminCourseController.editTraining')
  Route.post('/deleteCarevan', 'Admin/AdminCourse/AdminCourseController.deleteCarevan')

  Route.get('/subscribers', 'Admin/AdminCourse/AdminCourseController.courseSubscribers')
  Route.get('/yearlySubscribers', 'Admin/AdminCourse/AdminCourseController.yearlySubscribers')
  Route.get('/countAllActiveUsers', 'Admin/AdminCourse/AdminCourseController.countAllActiveUsers')

  Route.post('/uploadImageToVulterObject', 'Admin/AdminCourse/AdminCourseController.uploadImageToVulterObject')
  Route.post('/reorderCourse', 'Admin/AdminCourse/AdminCourseController.reorderCourse')
  Route.post('/reorderPreLicensing', 'Admin/AdminCourse/AdminCourseController.reorderPreLicensing')

  Route.get('/webnair/get/yearly_subscribers', 'Admin/AdminCourse/AdminCourseController.yearly_subscribers')
  Route.get('/course/get/all', 'Admin/AdminCourse/AdminCourseController.getCarevanCourse')


  Route.get('/narCourse/getAll', 'Admin/AdminCourse/AdminCourseController.getAllNarCourse')
  Route.get('/narCourse/single/:id', 'Admin/AdminCourse/AdminCourseController.getSingleNarCourse')
  Route.post('/narCourse/add', 'Admin/AdminCourse/AdminCourseController.createNarCourse')
  Route.post('/narCourse/edit', 'Admin/AdminCourse/AdminCourseController.editNarCourse')
  Route.post('/narCourse/delete', 'Admin/AdminCourse/AdminCourseController.deleteNarCourse')

  Route.get('/preLicensing/getAllLimit', 'Admin/AdminCourse/AdminCourseController.getAllLimitPreLicensing')
  Route.get('/preLicensing/getAll', 'Admin/AdminCourse/AdminCourseController.getAllPreLicensing')
  Route.get('/preLicensing/single/:id', 'Admin/AdminCourse/AdminCourseController.getSinglePreLicensing')
  Route.post('/preLicensing/add', 'Admin/AdminCourse/AdminCourseController.createPreLicensing')
  Route.post('/preLicensing/edit', 'Admin/AdminCourse/AdminCourseController.editPreLicensing')
  Route.post('/preLicensing/delete', 'Admin/AdminCourse/AdminCourseController.deletePreLicensing')
  Route.post('/preLicensing/sort', 'Admin/AdminCourse/AdminCourseController.sortPreLicensing')

  // Route.get('/narCourse/getAll', 'Admin/AdminCourse/AdminCourseController.getAllNarCourse')
  // Route.post('/narCourse/add', 'Admin/AdminCourse/AdminCourseController.createNarCourse')
  // Route.get('/narCourse/single/:id', 'Admin/AdminCourse/AdminCourseController.getSingleNarCourse')
  // Route.post('/narCourse/edit', 'Admin/AdminCourse/AdminCourseController.editNarCourse')

}).prefix('adminCourse')


Route.get('get/allCourseType', 'Course/CourseController.getAllCourseType')
Route.get('get/allCourseTypeCount', 'Course/CourseController.getAllCourseTypeCount')
Route.get('get/:type', 'Course/CourseController.getCourseByType')

Route.get('get/contents/:id', 'Course/CourseController.getCourseContentsById')
