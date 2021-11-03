// components/messageList/messageList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    messageUserList: {
      type: Array,
      value: []
    },

    lastMessage: {
      type:Array,
      value:[]
    },

    userList: {
      type:Array,
      value:[]
    },

    s_rightList: {
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    gomessage(event) {
      wx.navigateTo({
        url: `pages/chat-room/chat-room?userId=${e.currentTarget.dataset.userid}`,
      })
    }
  }
})
