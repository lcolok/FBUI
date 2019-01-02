var AV = require('leancloud-storage');
var { Realtime } = require('leancloud-realtime');
var { TypedMessagesPlugin, ImageMessage } = require('leancloud-realtime-plugin-typed-messages');

// 初始化存储 SDK
AV.init({
    appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
    appKey: 'vLplaY3j4OYf3e6e603sb0JX',
});

var ShimoBed = AV.Object.extend('ShimoBed');

function addTodo() {
    var value = this.newTodo && this.newTodo.trim()
    if (!value) {
        return
    }
    var acl = new AV.ACL()
    acl.setPublicReadAccess(false)
    acl.setPublicWriteAccess(false)
    acl.setReadAccess(AV.User.current(), true)
    acl.setWriteAccess(AV.User.current(), true)
    new ShimoBed({
        content: value,
        done: false,
        user: AV.User.current()
    }).setACL(acl).save().then(function (todo) {
        this.todos.push(todo.toJSON())
    }.bind(this)).catch(alert)
    this.newTodo = ''
}