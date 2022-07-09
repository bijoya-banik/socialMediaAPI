import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{

  Route.get('/get/all', 'Admin/AdminBlog/AdminBlogController.getAllBlogs')
  Route.get('/single/:id', 'Admin/AdminBlog/AdminBlogController.getSingle')
  Route.post('/create/new', 'Admin/AdminBlog/AdminBlogController.addNewBlog')
  Route.post('/edit', 'Admin/AdminBlog/AdminBlogController.editBlog')
  Route.post('/delete', 'Admin/AdminBlog/AdminBlogController.deleteBlogs')

  Route.get('/categories/all', 'Admin/AdminBlog/AdminBlogController.getAllBlogsCategories')

  Route.get('/policy-pages/single/:id', 'Admin/AdminBlog/AdminBlogController.getPolicyPageSingle')
  Route.get('/policy-pages/getAll', 'Admin/AdminBlog/AdminBlogController.getAllPolicyPages')
  Route.post('/policy-pages/edit', 'Admin/AdminBlog/AdminBlogController.editPolicyPage')
  Route.post('/policy-pages/delete', 'Admin/AdminBlog/AdminBlogController.deletePolicyPage')
}).prefix('adminBlog').middleware('auth')



