import tippy from 'tippy.js';
import { add, rem } from 'event';

export default class Tooltip {
 constructor(opt) {
  this.tipId_ = Date.now() * Math.random();
  Object.assign(this, opt);
  const props = {
   trigger: this.trigger || 'mousedown',
   interactive: true,
   duration: 150,
   placement: this.placement,
   maxWidth: '',
   zIndex: this.zIndex || 5,
   plugins: [],
   allowHTML: true,
   appendTo: this.appendTo,
   popperOptions: this.popperOptions,
   content: this.content,
   offset: this.offset,
   onShow: this.onShow,
   onTrigger: this.onTrigger,
   hideOnClick: this.hideOnClick,
   onHidden: this.onHidden,
   triggerTarget: this.triggerTarget,
   arrow: false,
  };
  if (this.arrow) props.arrow = '<svg id="svg"width="16" height="6"><path class="svg-arrow" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"/><path class="svg-content" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z"/></svg>';
  if (this.onDestroy) {
   props.onDestroy = () => {
    this.onDestroy();
    this.destroy.bind(this);
   };
  }
  if (this.menu) {
   this.onClick = (e) => this.menu.get(e.target.textContent)?.onClick(this.ctx_);
   props.content = this.menu_();
   props.onHide = () => !this.onContextMenu?.(this.ctx_);
  }
  this.tip = tippy(this.ref, props);

  if (this.trigger === 'manual') add(this.ref, 'contextmenu', this.contextMenu_.bind(this), this.tipId_, { passive: false });
  if (this.show) this.tip.show();
  if (this.hideOnEsc) add(document.body, 'keydown', this.hideOnEsc_.bind(this), this.tipId_);
  if (this.onClick) {
   add(this.tip.popper, 'mousedown', this.onClickEv_.bind(this), this.tipId_);
   add(this.tip.popper, 'mouseup', this.unClickEv_.bind(this), this.tipId_);
  }
 }

 contextMenu_(e) {
  e.preventDefault();
  this.ctx_ = e;
  this.tip.setProps({ getReferenceClientRect: () => ({ width: 0, height: 0, top: e.clientY, bottom: e.clientY, left: e.clientX, right: e.clientX }) });
  this.tip.show();
  this.onContextMenu?.(e);
 }

 onClickEv_(e) {
  if (e.button !== 0) return;
  if (e.target.textContent === 'Sterge') {
   e.target.classList.add('process');
   this.timeout_ = setTimeout(() => {
    this.onClick(e);
    this.tip.hide();
    e.target.classList.remove('process');
   }, 1000);
  } else {
   const hide = this.onClick(e);
   if (hide || typeof hide === 'undefined') this.tip.hide();
  }
 }

 unClickEv_(e) {
  if (e.target.textContent === 'Sterge') {
   e.target.classList.remove('process');
   clearTimeout(this.timeout_);
   this.timeout_ = null;
  }
 }

 menu_() {
  const menu = document.createElement('ul');
  add(menu, 'contextmenu', (e) => e.preventDefault(), this.tipId_, { passive: false });
  menu.className = 'tmenu';
  for (const [key, value] of this.menu) {
   const item = document.createElement('li');
   item.className = 'item';
   if (value.class) item.classList.add(value.class);
   item.textContent = key;
   menu.appendChild(item);
  }
  return menu;
 }

 hideOnEsc_(e) {
  if (e.key === 'Escape') {
   this.tip.hide();
   e.stopPropagation();
  }
 }

 destroy() {
  this.ctx_ = null;
  rem(this.tipId_);
  if (this.tip && !this.tip.state.isDestroyed) this.tip.destroy();
  this.tip = null;
 }
}
