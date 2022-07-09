import Route from '@ioc:Adonis/Core/Route'
Route.group(()=>{
}).prefix('blog').middleware('auth')
Route.get('/app/blog/get/caregories', 'Blog/BlogController.getBlogCategories')
Route.get('/app/blog/get/populer', 'Blog/BlogController.getPopulerBlogPost')
Route.get('/app/blog/get/recent', 'Blog/BlogController.recentPosts')
Route.get('/app/blog/recent_blogs', 'Blog/BlogController.recent_blogs')
Route.get('/app/blog/single/get/:id', 'Blog/BlogController.getSinglePost')


Route.post('/email/message/send', 'Blog/BlogController.emailMsgSend')



