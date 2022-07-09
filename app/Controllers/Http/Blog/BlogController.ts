import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BlogService from './BlogService';
import BlogValidator from './BlogValidator';
export default class BlogController {
  private blogService : BlogService
  private blogValidator : BlogValidator
  constructor () {
    this.blogService =  new BlogService()
    this.blogValidator =  new BlogValidator()
  }
  public async getBlogByLimit(ctx : HttpContextContract) {
    await this.blogValidator.validateBlogSchema(ctx)
    return this.blogService.getBlogByLimit(ctx)
  }
  public async getBlogCategories() {
    return this.blogService.getBlogCategories()
  }
  public async getPopulerBlogPost() {
    return this.blogService.getPopulerBlogPost()
  }
  public async recentPosts(ctx : HttpContextContract) {
    return this.blogService.recentPosts(ctx)
  }
  public async recent_blogs(ctx : HttpContextContract) {
    return this.blogService.recent_blogs(ctx)
  }
  public async emailMsgSend(ctx : HttpContextContract) {
    return this.blogService.emailMsgSend(ctx)
  }
  public async getSinglePost(ctx : HttpContextContract) {
    return this.blogService.getSinglePost(ctx)
  }







}
