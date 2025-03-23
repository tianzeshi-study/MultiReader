// 监听主线程发送来的消息，消息中应包含 token
self.addEventListener('message', async (event) => {
  const token = event.data.token;
  
  try {
    const response = await fetch('http://localhost:3000/books', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 通过 Authorization 头传递 token，这里假设 token 使用 Bearer 方式
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 获取返回的 JSON 对象
    const data = await response.json();
    
    // 在 worker 中打印返回的 JSON 对象
    console.log('Books data:', data);
    
    // 将数据发送回主线程
    self.postMessage({ success: true, data });
  } catch (error) {
    console.error('Error fetching books:', error);
    // 发送错误信息回主线程
    self.postMessage({ success: false, error: error.message });
  }
});
