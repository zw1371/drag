// 兼容各大浏览器的事件处理方法
window.EventUnit = {

  addHandler: function(element, type, handler) { // 绑定事件
    if( element.addEventListener ) { // 非IE浏览器
      element.addEventListener(type, handler,false);
    } else if( element.attachEvent ) { // IE浏览器
      element.attachEvent("on"+type, handler);
    } else { // 其他情况
      element["on"+type] = handler;
    }
  },

  getEvent: function(event) { // 获取事件源
    return event ? event : window.event; // 主要是火狐没有event对象
  },

  getTarget: function(event) { // IE下,event对象有srcElement属性,但是没有target属性;Firefox下,event对象有target属性,但是没有srcElement属性.
    return event.target || event.srcElement;
  },

  preventDefault: function(event) { // 阻止默认行为
    if( event.preventDefault ) { // 非IE浏览器
      event.preventDefault();
    } else { // IE浏览器
      evemt.returnValue = false;
    }
  },

  removeHandler: function(element, type, handler) { // 移除事件
    if( element.removeEventListener ) { // 非IE浏览器
      element.removeEventListener(type, handler, false);
    } else if ( element.detachEvent ) { // IE浏览器
      element.detachEvent("on"+type, handler);
    } else { // 其他情况
      element["on"+type] = null;
    }
  },

  stopPropagation: function() { // 阻止事件冒泡
    if( event.stopPropagation ) { // 非IE浏览器
      event.stopPropagation()
    } else { // IE浏览器
      evemt.cancelButton = true;
    }
  }

}

// 自定义事件
function EventTarget() {
  this.handlers = {} // 事件数组
}

EventTarget.prototype = {

  constructor:EventTarget, // 将构造函数指向自身,因为给prototype设置对象会改变prototype的指向,这个时候利用constructor来判断对象类型就会有问题,所以将constructor修改回来
  
  addHandler: function(type, handler) { // 绑定自定义事件
    if( typeof this.handlers[type] == "undefined" ) {
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)
  },

  fire: function(event) { // 触发自定义事件
    if( !event.target ) {
      event.target = this;
    }
    if( this.handlers[event.type] instanceof Array ) { // 指定触发的事件类型，存在事件
      var handlers = this.handlers[event.type];
      var len = handlers.length;
      for(var i = 0; i < len; i++) { // 循环触发事件
        handlers[i](event);
      }
    }
  },

  removeHandler: function(type, handler) { // 移除自定义事件
    if( this.handlers[event.type] instanceof Array ) {
      var handlers = this.handlers[event.type];
      var len = handlers.length;
      for( var i = 0; i < len; i++ ) {
        if( handlers[i] == handler ) { // 找到指定事件所处的索引
          break;
        }
      }
      handlers.splice(i, 1); // 根据索引删除指定事件
    }
  }

}

window.DragDrop = function() {

  var dragDrop = new EventTarget(),
      dragging = null,
      diffX = 0,
      diffY = 0;

  function handleEvent(event) {
    event = EventUnit.getEvent(event);
    var target = EventUnit.getTarget(event);
    switch ( event.type ) {
      case "mousedown":
          if( target.className.indexOf("draggable" ) > -1) {
            dragging = target;
            diffX = event.clientX - target.offsetLeft; // 记录初始位置X
            diffY = event.clientY - target.offsetTop; // 记录初始位置Y
            dragDrop.fire({type:"dragstart", target:dragging, x:event.clientX, y:event.clientY});
          }
        break;
      case "mousemove":
          if( dragging != null ) {
            EventUnit.preventDefault(event);
            dragging.style.left = (event.clientX - diffX) + "px"; // 当前位置减去初始位置,然后移动到指定位置
            dragging.style.top = (event.clientY - diffY) + "px"; // 当前位置减去初始位置,然后移动到指定位置
            dragDrop.fire({type:"drag", target:dragging, x:event.clientX, y:event.clientY});
          }
        break;
      case "mouseup":
          dragDrop.fire({type:"dragend", target:dragging, x:event.clientX, y:event.clientY});
          dragging = null;
        break;
      default:
    }
  }

  dragDrop.enable = function() {
    EventUnit.addHandler(document, "mousedown", handleEvent);
    EventUnit.addHandler(document, "mousemove", handleEvent);
    EventUnit.addHandler(document, "mouseup", handleEvent);
  }

  dragDrop.disable = function() {
    EventUnit.removeHandler(document, "mousedown", handleEvent);
    EventUnit.removeHandler(document, "mousemove", handleEvent);
    EventUnit.removeHandler(document, "mouseup", handleEvent);
  }

  dragDrop.enable();
  return dragDrop;

}();
