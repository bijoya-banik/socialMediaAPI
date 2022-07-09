import { BaseTask } from 'adonis5-scheduler/build'
import User from 'App/Models/User';
import Redis from '@ioc:Adonis/Addons/Redis'
export default class MyTaskName extends BaseTask {
	public static get schedule() {
		return '30 * * * * *'
	}
	/**
	 * Set enable use .lock file for block run retry task
	 * Lock file save to `build/tmpTaskLock`
	 */
	public static get useLock() {
		return false
	}

	public async handle() {
		// console.log("starting ..")
		let now = Math.round(Date.now() / 1000)-30;

		let offline_user = await User.query().select('id','last_active').where('last_active','<=',now).where('is_online','online')
		let online_user =	await User.query().select('id','last_active').where('last_active','>',now).where('is_online','offline')


		let offline_ids:any = []
		for(let item of offline_user){
			await Redis.publish('online', JSON.stringify({ data: item,user_id:item.id }))
			offline_ids.push(item.id)
		}
		if(offline_ids.length){
			 await User.query().whereIn('id',offline_ids).update({is_online:'offline'})
		}
		//  console.log("offline ids = " , offline_ids)



		let online_ids:any = []
		for(let item of online_user){
			await Redis.publish('online', JSON.stringify({ data: item,user_id:item.id }))
			online_ids.push(item.id)
		}
		if(online_ids.length){
			await User.query().whereIn('id',online_ids).update({is_online:'online'})
		}
		// console.log("online ids = " , online_ids)


		// console.log("closing...")
  	}

}
