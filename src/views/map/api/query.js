

import request from '@/utils/request'


//根据角色id查询指定
export function getFlyPath(data) {
  let url = "http://crack.jyaitech.com/FlyPath/GetFlyPath"
  return request.get(url, { params: data }
  )
}


export function saveFlyPath(data) {
  let url = "http://crack.jyaitech.com/FlyPath/SaveFlyPath"
  return request.post(url, data)
}

export function deleteFlyPath(id) {
  let url = "http://crack.jyaitech.com/FlyPath/deleteFlyPath"
  return request.delete(url, { params: { id: id } })
}
