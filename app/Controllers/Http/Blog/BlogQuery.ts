import User from '../../../Models/User'
import BlogCategory from '../../../Models/BlogCategory'
import Status from '../../../Models/Status'


export default class BlogQuery{
    public async getUserByLimit(limit : number) : Promise<User[]> {
       const user = User.query().limit(limit)
       return user
    }
    public async getBlogCategories() : Promise<BlogCategory[]> {
            return BlogCategory.all()
     }

     async getPopulerBlogPost() {

       return Status.query()
            .where('activity_type', 'Blog')
            .preload('feedUser')
            // .with('like', (builder) => {
            //     builder.where('user_id', user.id)
            // })
            // .withCount('totalLikes')
            // .withCount('totalComments')
            // .withCount('totalShares')
            .orderBy('views', 'asc')
            .limit(6)
            // .fetch()
    }

    async recentPosts(page:number, pagesize:number){
        return Status.query()
            .where('activity_type', 'Blog')
            .preload('feedUser')
            .orderBy('views', 'asc')
            .paginate(page,pagesize)

    }
    async recent_blogs(more:number,  ){
        let q= Status.query()
            .where('activity_type', 'Blog')
            .preload('feedUser')
      if(more > 0){
        q.where('id', '>', more)
      }
      return q.orderBy('id', 'asc').limit(15)
    }
    async getSinglePost(id){
        return Status.query().
               where('id',id)
            .where('activity_type', 'Blog')
            .preload('feedUser')
            .first()

    }
    async increseViews(ob){
      return Status.query().
             where('id',ob.id)
          .where('activity_type', 'Blog')
          .update(ob)

  }



}
