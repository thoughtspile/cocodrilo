(() => {
  // index.ts
  function setChildren(target, childList) {
    target.childNodes.forEach((c) => c.remove());
    childList.forEach((c) => c && target.appendChild(c instanceof Node ? c : text(c)));
    return target;
  }
  function assign(target, attributes) {
    Object.entries(attributes).forEach(([a, v]) => {
      if (a === "style")
        Object.assign(target[a], v);
      else if (a in target)
        target[a] = v;
      else
        typeof v === "string" ? target.setAttribute(a, v) : target.removeAttribute(a);
    });
    return target;
  }
  function patch(target) {
    return Object.assign(target, {
      withClass: (...classes) => {
        classes.forEach((c) => {
          if (typeof c === "string")
            target.classList.toggle(c, true);
          else
            Object.entries(c).forEach(([cls, val]) => target.classList.toggle(cls, !!val));
        });
        return target;
      },
      on: (events, options) => {
        Object.entries(events).forEach(([e, h]) => target.addEventListener(e, h, options));
        if (options && options.stop)
          options.stop((e) => target.removeEventListener(e, events[e], options));
        return target;
      }
    });
  }
  function el(tag, props = {}, children = []) {
    const node = tag instanceof HTMLElement ? tag : document.createElement(tag, "is" in props ? props : void 0);
    return setChildren(assign(patch(node), props), children);
  }
  var text = (text2) => document.createTextNode(text2);

  // todo.ts
  var STORAGE_KEY = "todos-redom";
  var todoStorage = {
    fetch: () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
    save: (todos) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  };
  var Todo = (props) => {
    const item = el("li", { className: "todo" }, [
      el("div", { className: "view" }, [
        el("input", {
          className: "toggle",
          type: "checkbox",
          checked: props.item.done
        }).on({
          change: (e) => props.onChange({ ...props.item, done: e.currentTarget.checked })
        }),
        el("label", {}, [
          props.item.title
        ]),
        el("button", { className: "destroy" }).on({
          click: () => props.remove()
        })
      ]),
      el("form", {}, [
        el("input", {
          class: "edit",
          type: "text",
          name: "title"
        })
      ]).on({
        submit: (e) => {
          e.preventDefault();
          const title = new FormData(e.currentTarget).get("title");
          props.onChange({ ...props.item, title });
          item.classList.remove("editing");
        }
      })
    ]).on({
      dblclick: () => item.withClass("editing")
    });
    return item;
  };
  var filters = {
    all: (e) => true,
    active: (e) => e.done,
    completed: (e) => !e.done
  };
  var TodoApp = (node) => {
    let filter = filters.all;
    let data = [];
    const update = () => {
      todoStorage.save(data);
      const visible = data.filter(([props]) => filter(props));
      setChildren(counter, [String(visible.length)]);
      setChildren(todoList, visible.map((v) => v[1]));
    };
    const addItem = (item) => {
      const remove = () => {
        data = data.filter((d) => d[0] !== item);
        update();
      };
      const cmp = Todo({ item, remove, onChange: (v) => Object.assign(item, v) });
      data.push([item, cmp]);
      createInput.value = "";
      update();
    };
    const createInput = el("input", {
      class: "new-todo",
      type: "text",
      placeholder: "What needs to be done?"
    });
    const todoList = el("ul", { className: "todo-list" });
    const counter = el("strong", {}, ["0"]);
    const Filter = (label, value) => el("li", {}, [
      el("label", {}, [
        el("input", {
          type: "radio",
          value,
          name: "filter"
        }).on({
          click: () => {
            filter = filters[value];
            update();
          }
        }),
        label
      ])
    ]);
    return el(node, {}, [
      el("section", { className: "todoapp" }, [
        el("header", { className: "header" }, [
          el("h1", { className: "heading" }, ["todos"]),
          el("form", {}, [
            createInput
          ]).on({
            submit: (evt) => {
              evt.preventDefault();
              addItem({ done: false, title: createInput.value });
            }
          })
        ]),
        el("section", { className: "main" }, [
          el("input", {
            class: "toggle-all",
            type: "checkbox"
          }).on({
            click: () => {
              const allDone = data.every((d) => d[0].done);
              data.forEach((d) => d[0].done = !allDone);
            }
          }),
          el("label", {
            for: "toggle-all"
          }, ["Mark all as complete"]),
          todoList
        ]),
        el("footer", { className: "footer" }, [
          el("span", { className: "todo-count" }, [
            counter,
            " items left"
          ]),
          el("ul", { className: "filters" }, [
            Filter("All", "all"),
            Filter("Active", "active"),
            Filter("Completed", "completed")
          ]),
          el("button", { className: "clear-completed" }, [
            "Clear Completed"
          ]).on({
            click: () => {
              data = data.filter((d) => !d[0].done);
              update();
            }
          })
        ])
      ]),
      el("footer", { className: "info" }, [
        el("p", {}, ["Double-click to edit a todo"]),
        el("p", {}, [
          "Written by ",
          el("a", {
            href: "https://www.mauroreisvieira.com/"
          }, ["Mauro Reis Vieira"])
        ]),
        el("p", {}, [
          "Part of ",
          el("a", {
            href: "http://todomvc.com"
          }, ["TodoMVC"])
        ])
      ])
    ]);
  };
  TodoApp(document.body);
})();
