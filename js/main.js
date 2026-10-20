/* Ягуар — футбольная школа: интерактив сайта */
(function () {
  'use strict';

  /* ---------- Шапка: фон при прокрутке ---------- */
  var header = document.getElementById('header');
  function onScroll() {
    var scrolled = window.scrollY > 40;
    header.classList.toggle('bg-ink-900/90', scrolled);
    header.classList.toggle('backdrop-blur', scrolled);
    header.classList.toggle('shadow-lg', scrolled);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    menu.classList.toggle('hidden', !open);
    burger.setAttribute('aria-expanded', String(open));
    burger.querySelector('.icon-open').classList.toggle('hidden', open);
    burger.querySelector('.icon-close').classList.toggle('hidden', !open);
    if (open) header.classList.add('bg-ink-900/90', 'backdrop-blur');
    else onScroll();
  }
  burger.addEventListener('click', function () {
    setMenu(menu.classList.contains('hidden'));
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1024) setMenu(false);
  });

  /* ---------- Появление блоков при прокрутке ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Фильтр филиалов ---------- */
  var chips = document.querySelectorAll('[data-filter]');
  var branches = document.querySelectorAll('.branch');
  var empty = document.getElementById('branch-empty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-selected', String(active));
      });
      var shown = 0;
      branches.forEach(function (b) {
        var match = f === 'all' || b.dataset.type === f;
        b.classList.toggle('hidden', !match);
        if (match) shown++;
      });
      empty.classList.toggle('hidden', shown > 0);
    });
  });

  /* ---------- FAQ-аккордеон ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-btn');
    btn.addEventListener('click', function () {
      var willOpen = !item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(function (o) {
        o.classList.remove('is-open');
        o.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Предзаполнение формы из кнопок ---------- */
  var planField = document.getElementById('plan-field');
  var branchField = document.getElementById('branch-field');
  document.querySelectorAll('[data-plan],[data-branch],[data-intent]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (el.dataset.plan) planField.value = el.dataset.plan;
      if (el.dataset.intent) planField.value = el.dataset.intent;
      if (el.dataset.branch) branchField.value = el.dataset.branch;
    });
  });

  /* ---------- Маска телефона ---------- */
  var phone = document.getElementById('phone');
  function formatPhone(value) {
    var d = value.replace(/\D/g, '');
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }
  phone.addEventListener('input', function () { phone.value = formatPhone(phone.value); });
  phone.addEventListener('focus', function () { if (!phone.value) phone.value = '+7 ('; });
  phone.addEventListener('blur', function () { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });

  /* URL опубликованного веб-приложения Apps Script (не адрес таблицы).
     Инструкция: integrations/google-sheets/README.md */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzXRl0T0jIzmMeFy-k9hgJxwtzdCk-GmS0NgIKnrWY0cS5RijlhqVcWx5009A5vlpex/exec';
  var form = document.getElementById('signup-form');
  var errorBox = document.getElementById('form-error');
  var success = document.getElementById('form-success');
  var pending = false;
  var requestId = '';

  function showError(msg, field) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
    if (field) {
      field.classList.add('!border-[#ff8a80]');
      field.focus();
      field.addEventListener('input', function clear() {
        field.classList.remove('!border-[#ff8a80]');
        field.removeEventListener('input', clear);
      });
      field.addEventListener('change', function clear() {
        field.classList.remove('!border-[#ff8a80]');
        field.removeEventListener('change', clear);
      });
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (pending) return;
    errorBox.classList.add('hidden');
    var f = form.elements;
    if (f.name.value.trim().length < 2) return showError('Укажите, пожалуйста, ваше имя.', f.name);
    if (f.phone.value.replace(/\D/g, '').length !== 11) return showError('Введите номер телефона полностью.', f.phone);
    if (!f.age.value) return showError('Выберите возраст ребёнка.', f.age);
    if (!f.branch.value) return showError('Выберите филиал.', f.branch);
    if (!f.agree.checked) return showError('Нужно согласие на обработку персональных данных.');
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(FORM_ENDPOINT)) {
      return showError('Онлайн-запись пока недоступна. Позвоните нам: +7 (909) 793-58-77.');
    }
    if (!requestId) requestId = crypto.randomUUID();

    var data = {
      name: f.name.value.trim(),
      phone: f.phone.value,
      age: f.age.value,
      branch: f.branch.options[f.branch.selectedIndex].text,
      plan: f.plan.value || 'Пробное занятие',
      agree: 'yes',
      website: f.website.value,
      requestId: requestId
    };

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    pending = true;

    var done = function () {
      form.classList.add('hidden');
      success.classList.remove('hidden');
    };

    // POST через iframe: не требует CORS и не передаёт телефон в URL.
    // Успех показываем только после подтверждения записи из Apps Script.
    var frame = document.createElement('iframe');
    frame.name = 'signup-' + crypto.randomUUID();
    frame.hidden = true;
    frame.title = 'Отправка заявки';
    var transport = document.createElement('form');
    transport.hidden = true;
    transport.method = 'POST';
    transport.action = FORM_ENDPOINT;
    transport.target = frame.name;
    Object.keys(data).forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      transport.appendChild(input);
    });
    function finish(ok) {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      transport.remove();
      frame.remove();
      pending = false;
      btn.disabled = false;
      btn.textContent = 'Записаться на бесплатное занятие';
      if (ok) done();
      else showError('Не удалось подтвердить отправку. Попробуйте ещё раз или позвоните: +7 (909) 793-58-77.');
    }
    function receive(event) {
      if (!/^https:\/\/(?:script\.google\.com|script\.googleusercontent\.com|[a-z0-9-]+-script\.googleusercontent\.com)$/.test(event.origin)) return;
      var reply = event.data;
      if (!reply || reply.type !== 'jaguar-signup' || reply.requestId !== requestId) return;
      finish(reply.ok === true);
    }
    window.addEventListener('message', receive);
    var timer = setTimeout(function () { finish(false); }, 45000);
    document.body.appendChild(frame);
    document.body.appendChild(transport);
    transport.submit();
  });

  /* ---------- Год в подвале ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
