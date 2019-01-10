AV.init({
  appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
  appKey: 'vLplaY3j4OYf3e6e603sb0JX',
})




var Todo = AV.Object.extend('Todo')

// visibility filters
var filters = {
  all: function (todos) {
    return todos
  },
  active: function (todos) {
    return todos.filter(function (todo) {
      return !todo.done
    })
  },
  completed: function (todos) {
    return todos.filter(function (todo) {
      return todo.done
    })
  }
}

var bind = (subscription, initialStats, onChange) => {
  let stats = [...initialStats]
  const remove = value => {
    stats = stats.filter(target => target.id !== value.id)
    return onChange(stats)
  }
  const upsert = value => {
    let existed = false
    stats = stats.map(target => (target.id === value.id ? ((existed = true), value) : target))
    if (!existed) stats = [value, ...stats]
    return onChange(stats)
  }
  subscription.on('create', upsert)
  subscription.on('update', upsert)
  subscription.on('enter', upsert)
  subscription.on('leave', remove)
  subscription.on('delete', remove)
  return () => {
    subscription.off('create', upsert)
    subscription.off('update', upsert)
    subscription.off('enter', upsert)
    subscription.off('leave', remove)
    subscription.off('delete', remove)
  }
}

// app Vue instance
var app = new Vue({
  // app initial state
  data: {
    todos: [],
    newTodo: '',
    editedTodo: null,
    visibility: 'all',
    username: '',
    password: '',
    user: null
  },
  
  created: function() {
    var user = AV.User.current()
    if (user) {
      // user.isAuthenticated().then(function(authenticated) {
      //   if (authenticated) {
          this.user = user.toJSON()
      //   }
      // }.bind(this))
    }
  },

  watch: {
    'user.objectId': {
      handler: function (id) {
        if (id) {
          this.fetchTodos(id)
        } else {
          this.todos = []
        }
      },
    }
  },

  // computed properties
  // https://vuejs.org/guide/computed.html
  computed: {
    filteredTodos: function () {
      return filters[this.visibility](this.todos)
    },
    remaining: function () {
      return filters.active(this.todos).length
    },
    allDone: {
      get: function () {
        return this.remaining === 0
      },
      set: function (done) {
        AV.Object.saveAll(
          filters[done ? 'active' : 'completed'](this.todos).map(function(todo) {
            todo.done = done
            return AV.Object.createWithoutData('Todo', todo.objectId).set('done', done)
          })
        )
      }
    }
  },

  filters: {
    pluralize: function (n) {
      return n === 1 ? '个项目' : '个项目'
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    fetchTodos: function(id) {
      const query = new AV.Query(Todo)
        .equalTo('user', AV.Object.createWithoutData('User', id))
        .descending('createdAt')
      const updateTodos = this.updateTodos.bind(this)
      return AV.Promise.all([query.find().then(updateTodos), query.subscribe()])
        .then(function([todos, subscription]) {
          this.subscription = subscription
          this.unbind = bind(subscription, todos, updateTodos)
        }.bind(this))
        .catch(alert)
    },

    login: function() {
      AV.User.logIn(this.username, this.password).then(function(user) {
        this.user = user.toJSON()
        this.username = this.password = ''
      }.bind(this)).catch(alert)
    },
    
    signup: function() {
      alert("暂时不开放注册。")
      return
      AV.User.signUp(this.username, this.password).then(function(user) {
        this.user = user.toJSON()
        this.username = this.password = ''
      }.bind(this)).catch(alert)
    },

    logout: function() {
      AV.User.logOut()
      this.user = null
      this.subscription.unsubscribe()
      this.unbind()
    },
    
    updateTodos: function(todos) {
      this.todos = todos.map(function(todo) {
        return todo.toJSON()
      })
      return todos
    },

    searchShimo: async function(){

      var key = this.newTodo;
      if(!key){}//啥都没有输入的话
 
      var result = await searchLC(key);
      // alert(JSON.stringify(this.todos[0]));
      this.todos=[];
      for(var i in result){
        this.todos.push({content:result[i]});
      }

    },
    
    addTodo: function () {
      var value = this.newTodo && this.newTodo.trim()
      if (!value) {
        return
      }
      var acl = new AV.ACL()
      acl.setPublicReadAccess(false)
      acl.setPublicWriteAccess(false)
      acl.setReadAccess(AV.User.current(), true)
      acl.setWriteAccess(AV.User.current(), true)
      new Todo({
        content: value,
        done: false,
        user: AV.User.current()
      }).setACL(acl).save().then(function(todo) {
        this.todos.push(todo.toJSON())
        // alert(JSON.stringify(todo.toJSON()));
      }.bind(this)).catch(alert)
      this.newTodo = ''
    },

    removeTodo: function (todo) {
      AV.Object.createWithoutData('Todo', todo.objectId)
        .destroy()
        .then(function() {
          this.todos.splice(this.todos.indexOf(todo), 1)
        }.bind(this))
        .catch(alert)
    },

    editTodo: function (todo) {
      this.beforeEditCache = todo.content
      this.editedTodo = todo
    },

    doneEdit: function (todo) {
      this.editedTodo = null
      todo.content = todo.content.trim()
      AV.Object.createWithoutData('Todo', todo.objectId).save({
        content: todo.content,
        done: todo.done
      }).catch(alert)
      if (!todo.content) {
        this.removeTodo(todo)
      }
    },

    cancelEdit: function (todo) {
      this.editedTodo = null
      todo.content = this.beforeEditCache
    },

    removeCompleted: function () {
      AV.Object.destroyAll(filters.completed(this.todos).map(function(todo) {
        return AV.Object.createWithoutData('Todo', todo.objectId)
      })).then(function() {
        this.todos = filters.active(this.todos)
      }.bind(this)).catch(alert)
    }
  },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // https://vuejs.org/guide/custom-directive.html
  directives: {
    'todo-focus': function (el, value) {
      if (value) {
        el.focus()
      }
    }
  }
})

// handle routing
function onHashChange () {
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    app.visibility = visibility
  } else {
    window.location.hash = ''
    app.visibility = 'all'
  }
}

async function searchLC(key) {
  var query = new AV.SearchQuery('ShimoBed');//class名
  query.queryString(key);//要搜索的关键词
  var resp = await query.find();

  //    console.log("找到了 " + query.hits() + " 个文件.");
  var result = [];

  resp.forEach(e => {

      var dic = e.attributes;

      // var output = `${dic.type} ${dic.name} | ${dic.shortURL}`;
      var output = `${emoji(dic.type)} ${dic.name} | ${cutHTTP(dic.shortURL)}`;

      if (!result.join().match(output)) {//去除重复项目
          result.push(output);
      }

  });
  
  return result;
}



function emoji(suffix) {
  var emoji;

  if (suffix.match(/[a-zA-Z]/g)) {
      if (suffix.match(/mp4|mov|avi/ig)) {//根据后缀给出emoji
          emoji = "🎬";//常规视频文件
      } else if (suffix.match(/webm|mkv|avi/ig)) {
          emoji = "▶️";//手机无法播放的非常规视频文件
      } else if (suffix.match(/mp3|ogg|wav|flac|ape|alca|aac/ig)) {
          emoji = "🎵";//音频文件
      } else if (suffix.match(/zip|7z|rar/ig)) {
          emoji = "📦";//压缩包
      } else if (suffix.match(/dmg|iso/ig)) {
          emoji = "💽";//光盘映像
      } else if (suffix.match(/ai|psd|aep/ig)) {
          emoji = "📐";//工程文件
      } else if (suffix.match(/ppt|pptx|key/ig)) {
          emoji = "📽️";//演示文件
      } else if (suffix.match(/ttf|otf/ig)) {
          emoji = "🔤️";//字体文件
      } else if (suffix.match(/doc|pdf/ig)) {
          emoji = "️📄";//文档
      } else {
          emoji = "❓";//未知格式
      }
  } else {
      emoji = suffix;
  }
  return emoji;
}

function cutHTTP(shortURL) {
  return shortURL;
  //    return 't.cn/'+shortURL.split('/').pop();
}


window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.todoapp')