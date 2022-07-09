import BlogCategory from '../../../../Models/BlogCategory'
import Status from '../../../../Models/Status'
import PolicyPage from '../../../../Models/PolicyPage'


export default class AdminBlogQuery{

    public async getAllBlogsCategoriesQuery() : Promise<BlogCategory[]> {
            return BlogCategory.all()
     }

     async getAllBlogsQury(page:number, pagesize:number) {

       return Status.query()
            .where('activity_type', 'Blog')
            .preload('feedUser')
            .orderBy('id', 'desc')
            .paginate(page, pagesize)
            // .fetch()
    }
    async getSingleQuery(id){
        return Status.query()
            .where('id',id)
            .where('activity_type', 'Blog')
            .preload('feedUser')
            .first()

    }

    async addNewBlogQuery(data){
        return Status.create(data)

    }
    async editBlogquery(data){
        return Status.query().where('id',data.id).update(data)
    }
    async deleteBlogsQuery(data){
        return Status.query().where('id',data.id).delete()
    }
    async getAllPolicyPagesQuery(page:number, pagesize:number) {

      return PolicyPage.query()
           .orderBy('name', 'asc')
           .paginate(page, pagesize)
           // .fetch()
   }
   async getPolicyPageSingleQuery(id){
       return PolicyPage.query()
           .where('id',id)
           .first()

   }
    async editPolicyPageQuery(data){
        return PolicyPage.query().where('id',data.id).update({
          data:data.inputData,
        })
    }
    async deletePolicyPageQuery(data){
        return PolicyPage.query().where('id',data.id).delete()
    }



}
