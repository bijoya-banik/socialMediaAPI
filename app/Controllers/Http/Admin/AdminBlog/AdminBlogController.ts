import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AdminBlogService from './AdminBlogService';
export default class AdminBlogController {
  private adminBlogService : AdminBlogService
  constructor () {
    this.adminBlogService =  new AdminBlogService()
  }


  public async getAllBlogsCategories() {
    return this.adminBlogService.getAllBlogsCategories()
  }
  public async getAllBlogs(ctx : HttpContextContract) {
    return this.adminBlogService.getAllBlogs(ctx)
  }
  public async getSingle(ctx : HttpContextContract) {
    return this.adminBlogService.getSingle(ctx)
  }
  public async addNewBlog(ctx : HttpContextContract) {
    return this.adminBlogService.addNewBlog(ctx)
  }
  public async editBlog(ctx : HttpContextContract) {
    return this.adminBlogService.editBlog(ctx)
  }
  public async deleteBlogs(ctx : HttpContextContract) {
    return this.adminBlogService.deleteBlogs(ctx)
  }



  public async getAllPolicyPages(ctx : HttpContextContract) {
    return this.adminBlogService.getAllPolicyPages(ctx)
  }
  public async getPolicyPageSingle(ctx : HttpContextContract) {
    return this.adminBlogService.getPolicyPageSingle(ctx)
  }
  public async editPolicyPage(ctx : HttpContextContract) {
    return this.adminBlogService.editPolicyPage(ctx)
  }
  public async deletePolicyPage(ctx : HttpContextContract) {
    return this.adminBlogService.deletePolicyPage(ctx)
  }







}
