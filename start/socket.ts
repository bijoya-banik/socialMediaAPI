import User from 'App/Models/User';
import Redis from '@ioc:Adonis/Addons/Redis'

// console.log('nice')
Redis.subscribe('online', async (data:any) => {
  let alldata = JSON.parse(data)
  if(alldata.data.is_online=='online'){
    let last_active =Math.round(Date.now() / 1000)
    await User.query().where('id', alldata.data.id).update({is_online: alldata.data.is_online,last_active:last_active})
  }
  else{
    await User.query().where('id', alldata.data.id).update({is_online: alldata.data.is_online})
  }

 
})




