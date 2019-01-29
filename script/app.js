try {
  AV.init({
    appId: 'Km0N0lCryHeME8pYGOpOLag5-gzGzoHsz',
    appKey: 'vLplaY3j4OYf3e6e603sb0JX',
  })
} catch (e) {

}




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

  created: function () {
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
          filters[done ? 'active' : 'completed'](this.todos).map(function (todo) {
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

    fetchTodos: function (id) {
      const query = new AV.Query(Todo)
        .equalTo('user', AV.Object.createWithoutData('User', id))
        .descending('createdAt')
      const updateTodos = this.updateTodos.bind(this)
      return AV.Promise.all([query.find().then(updateTodos), query.subscribe()])
        .then(function ([todos, subscription]) {
          this.subscription = subscription
          this.unbind = bind(subscription, todos, updateTodos)
        }.bind(this))
        .catch(alert)
    },

    login: function () {
      AV.User.logIn(this.username, this.password).then(function (user) {
        this.user = user.toJSON()
        this.username = this.password = ''
      }.bind(this)).catch(alert)
    },

    signup: function () {


      Vue.toasted.show(`暂时不开放注册`, {
        position: 'top-center',
        theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
        duration: 3000,
        iconPack: 'fontawesome',
        icon: { name: "exclamation-triangle" },
        fitToScreen: "true",
        type: "error",//Type of the Toast ['success', 'info', 'error']
        singleton: "true",
        // fullWidth:"true",
      });

      return
      AV.User.signUp(this.username, this.password).then(function (user) {
        this.user = user.toJSON()
        this.username = this.password = ''
      }.bind(this)).catch(alert)
    },

    logout: function () {
      AV.User.logOut()
      this.user = null
      this.subscription.unsubscribe()
      this.unbind()
    },

    updateTodos: function (todos) {
      this.todos = todos.map(function (todo) {
        return todo.toJSON()
      })
      return todos
    },

    toastShow: function () {
      Vue.toasted.show(`找不到关于“${this.newTodo}”的项目`, {
        position: 'top-center',
        theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
        duration: 3000,
        icon: { name: "search" },
        iconPack: 'fontawesome',
        fitToScreen: "true",
        type: "error"//Type of the Toast ['success', 'info', 'error']
        // fullWidth:"true",
      });
    }
    ,
    multiSelection: function () {

    },
    playVideo: function (todo) {
      console.log(todo);
      if (todo.uploaderURL) {
        window.open(todo.uploaderURL);
        // window.open('javascript:window.name;', '<script>location.replace("'+ todo.uploaderURL +'")<\/script>');
      } else {
        window.open(todo.shortURL);
        // window.open('javascript:window.name;', '<script>location.replace("'+ todo.shortURL +'")<\/script>');
      }

    },
    download: function (todo) {
      console.log(todo);
      if (todo.uploaderURL) {
        window.location.href = todo.uploaderURL + '?&download';
      } else {
        window.location.href = todo.shortURL;
      }


    },
    deleteContent: async function (todo) {
      if (todo.id) {
        var r = confirm("确定要删除此项目?");
        if (r == true) {

          AV.Cloud.run('deleteContent', {
            id: todo.id,
          });
          console.log(todo.objectId);
          // console.log(this.todos);
          AV.Object.createWithoutData('ShimoBed', todo.objectId)
            .destroy()
            .then(function () {
              this.todos.splice(this.todos.indexOf(todo), 1)
            }.bind(this))
            .catch(alert);
        }
        else {

        }


      } else {
        showError("没有石墨评论id号,无法删除!");
      }


    },
    copyAll: async function () {
      var all = await filters.completed(this.todos).map(function (todo) {
        return todo;
      });
      console.log(all);
      var clipboard = new ClipboardJS('.clear-completed', {

        text: function (trigger) {
          var copyAllContent = [];
          all.forEach(e => {
            copyAllContent.push(e.copyContent);
          });
          return copyAllContent.join('\n');
        }
      });
      clipboard.on('success', function (e) {
        console.log(e);

        Vue.toasted.success(`已复制`, {
          position: 'top-center',
          theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
          duration: 1000,
          iconPack: 'fontawesome',
          icon: { name: "copy" },
          fitToScreen: "true",
          type: "success",//Type of the Toast ['success', 'info', 'error']
          singleton: "true",
          // fullWidth:"true",
        });
        clipboard.destroy();
      });

      clipboard.on('error', function (e) {
        console.log(e);
      });

    }

    ,
    copy2Clipboard: async function (todo) {
      console.log(todo);

      var all = await filters.completed(this.todos).map(function (todo) {
        return todo;
      });

      if (all.length > 0) {
        var clipboard = new ClipboardJS('.ENVS', {

          text: function (trigger) {
            var copyAllContent = [];
            all.forEach(e => {
              copyAllContent.push(e.copyContent);
            });
            return copyAllContent.join('\n');
          }
        });
        clipboard.on('success', function (e) {
          console.log(e);

          Vue.toasted.success(`已复制选中的${all.length}项`, {
            position: 'top-center',
            theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
            duration: 3000,
            iconPack: 'fontawesome',
            icon: { name: "copy" },
            fitToScreen: "true",
            type: "success",//Type of the Toast ['success', 'info', 'error']
            singleton: "true",
            // fullWidth:"true",
          });
          clipboard.destroy();
        });

        clipboard.on('error', function (e) {
          console.log(e);
        });

      } else {
        var clipboard = new ClipboardJS('.ENVS', {
          text: function (trigger) {
            return todo.copyContent;
          }
        });
        clipboard.on('success', function (e) {
          console.log(e);

          Vue.toasted.success(`已复制`, {
            position: 'top-center',
            theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
            duration: 1000,
            iconPack: 'fontawesome',
            icon: { name: "copy" },
            fitToScreen: "true",
            type: "success",//Type of the Toast ['success', 'info', 'error']
            singleton: "true",
            // fullWidth:"true",
          });
          clipboard.destroy();
        });

        clipboard.on('error', function (e) {
          console.log(e);
        });
      }





    },
    searchShimo: async function () {
      var result = "";
      var key = this.newTodo;
      if (!key) {
        var data = await AV.Cloud.run('updateShimo');
        console.log(data);

        if (data > 0) {
          showUpdate(data);
        } else {
          showTop20();

        }

        var query = new AV.Query('ShimoBed');
        query.descending("updatedAt");
        query.limit(20);//请求数量上限为1000条
        var every = await query.find();

        console.log(every);

        result = makeAList(every);
        // console.log(result);
      } else {

        var result = await searchLC(key);
        // alert(JSON.stringify(this.todos[0]));
        if (result == "") {

          Vue.toasted.show(`找不到关于“${key}”的项目`, {
            position: 'top-center',
            theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
            duration: 3000,
            icon: { name: "search" },
            iconPack: 'fontawesome',
            fitToScreen: "true",
            type: "error"//Type of the Toast ['success', 'info', 'error']
            // fullWidth:"true",
          });
          return
        }
      }

      console.log(result);
      this.todos = result;



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
      }).setACL(acl).save().then(function (todo) {
        this.todos.push(todo.toJSON())
        // alert(JSON.stringify(todo.toJSON()));
      }.bind(this)).catch(alert)
      this.newTodo = ''
    },

    removeTodo: function (todo) {
      AV.Object.createWithoutData('Todo', todo.objectId)
        .destroy()
        .then(function () {
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
      AV.Object.destroyAll(filters.completed(this.todos).map(function (todo) {
        return AV.Object.createWithoutData('Todo', todo.objectId)
      })).then(function () {
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
function onHashChange() {
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    app.visibility = visibility
  } else {
    window.location.hash = ''
    app.visibility = 'all'
  }
}

function showError(text) {

  Vue.toasted.show(text, {
    position: 'top-center',
    theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
    duration: 0,
    icon: { name: "error" },
    iconPack: 'fontawesome',
    fitToScreen: "true",
    type: "error",//Type of the Toast ['success', 'info', 'error']
    singleton: "true",
    action: {

      text: 'Cancel',
      onClick: (e, toastObject) => {
        toastObject.goAway(0);

      },
    }
    // fullWidth:"true",
  });
}

function showUpdate(count) {


  Vue.toasted.success(`新增${count}条记录`, {
    position: 'top-center',
    theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
    duration: 3000,
    icon: { name: "sync-alt" },
    iconPack: 'fontawesome',
    fitToScreen: "true",
    type: "success",//Type of the Toast ['success', 'info', 'error']
    singleton: "true",
    // fullWidth:"true",
  });
}

function showTop20() {
  Vue.toasted.info(`已为你显示最近20条记录`, {
    position: 'top-center',
    theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
    duration: 3000,
    icon: { name: "eye" },
    iconPack: 'fontawesome',
    fitToScreen: "true",
    type: "success",//Type of the Toast ['success', 'info', 'error']
    singleton: "true",
    // fullWidth:"true",
  });
}

function toastInput() {

  Vue.toasted.show(`请输入关键词进行搜索`, {
    position: 'top-center',
    theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
    duration: 3000,
    icon: { name: "question-circle" },
    iconPack: 'fontawesome',
    fitToScreen: "true",
    type: "info",//Type of the Toast ['success', 'info', 'error']
    singleton: "true",
    // fullWidth:"true",
  });
};


function LeanCloudInit() {
  Vue.toasted.show(`连接中...`, {
    position: 'top-center',
    theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
    duration: 0,
    icon: { name: "search" },
    iconPack: 'fontawesome',
    fitToScreen: "true",
    type: "error"//Type of the Toast ['success', 'info', 'error']
    // fullWidth:"true",
  });

  AV.Cloud.run('alive').then(function (data) {
    // 成功
    // console.log('是否已经连接上leancloud:' + data);
    Vue.toasted.clear();
    Vue.toasted.show(`已连接LeanCloud`, {
      position: 'top-center',
      theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
      duration: 3000,
      icon: { name: "check" },
      iconPack: 'fontawesome',
      fitToScreen: "true",
      type: "success"//Type of the Toast ['success', 'info', 'error']
      // fullWidth:"true",
    });
  }, function (error) {
    // 失败
  });
}


function LeanCloudInitMute() {
  AV.Cloud.run('alive').then(function (data) {
    Vue.toasted.clear();
  }, function (error) {
    // 失败  
    Vue.toasted.show(`断开连接,正在重新连接...`, {
      position: 'top-center',
      theme: 'toasted-primary',//Theme of the toast you prefer['toasted-primary', 'outline', 'bubble']
      duration: 0,
      icon: { name: "search" },
      iconPack: 'fontawesome',
      fitToScreen: "true",
      type: "error"//Type of the Toast ['success', 'info', 'error']
      // fullWidth:"true",
    });
    LeanCloudInitMute();
  });
}

function jump() {
  var currentURL = window.location.href;
  console.log(currentURL);
  if (currentURL.match('lcolok.github.io/FBUI/')) {//如果是网页版的话
    window.open('https://lcolok.github.io/FBUI/vuetify');
  } else {//如果是本地打开的话
    var domain = currentURL.split('/').shift();
    window.open(domain+'/vuetify/');
  }

}


window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.todoapp')