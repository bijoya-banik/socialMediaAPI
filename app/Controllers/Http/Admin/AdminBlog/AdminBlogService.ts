import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AdminBlogQuery from './AdminBlogQuery';
export default class AdminBlogService {
    private adminBlogQuery : AdminBlogQuery
    constructor(){
      this.adminBlogQuery = new AdminBlogQuery
    }

    public async getAllBlogsCategories(){
      return await this.adminBlogQuery.getAllBlogsCategoriesQuery()
    }
    public async getAllBlogs(ctx : HttpContextContract){
      const page = ctx.request.all().page ? ctx.request.all().page : 1
      const pageSize = ctx.request.all().pageSize ? ctx.request.all().pageSize : 10
      const data = await this.adminBlogQuery.getAllBlogsQury(page,pageSize)
      return data
    }
    public async getSingle(ctx){
      let  status:any = await this.adminBlogQuery.getSingleQuery(ctx.params.id)
      if (status.data)    status.data = JSON.parse(status.data)
      return status
    }

    async addNewBlog(ctx) {
      let alldata = ctx.request.all()
      let user = { id:0 }
      try {
        user =  await ctx.auth.use('web').authenticate();
      } catch (error) {
        console.log("Erorro",error)
      }

      let input:any = {
          activity_text: alldata.activity_text ? alldata.activity_text : '',
          activity_type: 'Blog',
          blog_category_id: alldata.blog_category_id ? alldata.blog_category_id : null,
          privacy: alldata.privacy ? alldata.privacy : 'Public'
      }


      input.user_id = user.id
      input.data = {
          comments: [],
          json: alldata.content.json,
          html: alldata.content.html,
          cover: alldata.content.cover.url ? alldata.content.cover.url : '',
          meta: alldata.meta ? alldata.meta : {},
      }
      input.data = JSON.stringify(input.data)
      let status:any =  await this.adminBlogQuery.addNewBlogQuery(input);


      status.data = JSON.parse(status.data)

      status.activity_id = status.id
      status.__meta__ = {
          totalComments_count: 0,
          totalLikes_count: 0,
          totalShares_count: 0
      }

      return ctx.response.status(201).json({
        status: status
      })
    }
    async editBlog(ctx) {
      let alldata = ctx.request.all()
      let user = { id:0 }
      try {
        user =  await ctx.auth.use('web').authenticate();
      } catch (error) {
        console.log("Erorro",error)
      }

      let input:any = {

          activity_text: alldata.activity_text ? alldata.activity_text : '',
          blog_category_id: alldata.blog_category_id ? alldata.blog_category_id : null,
          privacy: alldata.privacy ? alldata.privacy : 'Public'
      }


      input.user_id = user.id
      input.id = alldata.id
      input.data = {
          comments: [],
          json: alldata.content.json,
          html: alldata.content.html,
          cover: alldata.content.cover.url ? alldata.content.cover.url : '',
          meta: alldata.meta ? alldata.meta : {},
      }
      input.data = JSON.stringify(input.data)
      let status:any =  await this.adminBlogQuery.editBlogquery(input);

      return ctx.response.status(200).json({
        status: status
      })
    }

    public async deleteBlogs(ctx){
      let  status:any = await this.adminBlogQuery.deleteBlogsQuery(ctx.params.id)
      return status
    }


    public async getAllPolicyPages(ctx : HttpContextContract){
      const page = ctx.request.all().page ? ctx.request.all().page : 1
      const pageSize = ctx.request.all().pageSize ? ctx.request.all().pageSize : 10
      const data = await this.adminBlogQuery.getAllPolicyPagesQuery(page,pageSize)
      return data
    }
    public async getPolicyPageSingle(ctx){
      let  status:any = await this.adminBlogQuery.getPolicyPageSingleQuery(ctx.params.id)
      if (status.data)    status.data = JSON.parse(status.data)
      return status
    }

    public async editPolicyPage (ctx : HttpContextContract){
      let alldata = ctx.request.all()
      let  inputData:any = {
          json: alldata.data.json,
          html: alldata.data.html,
      }
      inputData = JSON.stringify(inputData)
      let ob = {
        id:alldata.id,
        inputData:inputData
      }
      let  status:any = await this.adminBlogQuery.editPolicyPageQuery(ob)

      return ctx.response.status(201).json({
        status: status
      })

    }
    public async deletePolicyPage (ctx : HttpContextContract){

      let  status:any = await this.adminBlogQuery.deletePolicyPageQuery(ctx.params.id)
      return status

    }


};

