/**
 * ============================================
 * PORTFÓLIO EMANOEL CARIOLANDO
 * JavaScript puro - Funcionalidades:
 * - Efeito de digitação no título do Hero
 * - Menu mobile (hamburger)
 * - Scroll suave com offset para header fixo
 * - Scroll reveal com IntersectionObserver (animação sutil)
 * - Botão "Voltar ao topo"
 * - Alternância de tema (dark/light) + persistência + prefers-color-scheme
 * - Validação completa do formulário de contato (sem backend - simulação)
 * ============================================
 */

(function () {
  'use strict';

  // ==========================================
  // CONFIGURAÇÕES E CONSTANTES
  // ==========================================
  const CONFIG = {
    typingSpeed: 65,           // ms por caractere
    typingDelay: 600,          // delay inicial antes de começar a digitar
    scrollOffset: 80,          // compensação do header fixo (px)
    revealThreshold: 0.12,     // % do elemento visível para ativar reveal
    backToTopThreshold: 320,   // px de scroll para mostrar botão
  };

  // ==========================================
  // ELEMENTOS DO DOM (cacheados)
  // ==========================================
  const elements = {
    html: document.documentElement,
    header: document.querySelector('.header'),
    nav: document.getElementById('nav'),
    hamburger: document.getElementById('hamburger'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    heroTitle: document.getElementById('hero-title'),
    backToTopBtn: document.getElementById('back-to-top'),
    contactForm: document.getElementById('contact-form'),
    formSuccess: document.getElementById('form-success'),
    navLinks: document.querySelectorAll('.nav-link'),
  };

  // Texto original do título para o efeito de digitação
  const ORIGINAL_HERO_TITLE = 'Emanoel Cariolando — Desenvolvedor FullStack';

  // ==========================================
  // 1. EFEITO DE DIGITAÇÃO NO TÍTULO (HERO)
  // ==========================================
  function initTypingEffect() {
    const titleEl = elements.heroTitle;
    if (!titleEl) return;

    // Limpa o conteúdo e prepara para digitação
    const fullText = ORIGINAL_HERO_TITLE;
    titleEl.textContent = '';
    titleEl.setAttribute('aria-label', fullText);

    // Cria cursor piscante
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    cursor.setAttribute('aria-hidden', 'true');
    titleEl.appendChild(cursor);

    let charIndex = 0;

    function type() {
      if (charIndex < fullText.length) {
        // Insere o caractere antes do cursor
        const textNode = document.createTextNode(fullText.charAt(charIndex));
        titleEl.insertBefore(textNode, cursor);
        charIndex++;
        setTimeout(type, CONFIG.typingSpeed);
      } else {
        // Remove cursor após terminar (com delay)
        setTimeout(() => {
          if (cursor && cursor.parentNode) {
            cursor.parentNode.removeChild(cursor);
          }
        }, 1200);
      }
    }

    // Inicia após pequeno delay para dar tempo da página carregar visualmente
    setTimeout(type, CONFIG.typingDelay);
  }

  // ==========================================
  // 2. MENU MOBILE (HAMBURGER)
  // ==========================================
  function initMobileMenu() {
    const hamburger = elements.hamburger;
    const nav = elements.nav;

    if (!hamburger || !nav) return;

    function toggleMenu() {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      // Trava o scroll do body quando menu aberto (melhor UX mobile)
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Toggle no clique do hamburger
    hamburger.addEventListener('click', toggleMenu);

    // Fecha o menu ao clicar em qualquer link de navegação
    elements.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('open')) {
          closeMenu();
        }
      });
    });

    // Fecha ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Fecha ao clicar fora do menu (em mobile)
    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('open') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Acessibilidade extra: fecha menu se redimensionar para desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // 3. SCROLL SUAVE COM OFFSET (HEADER FIXO)
  // ==========================================
  function initSmoothScroll() {
    // Intercepta todos os links internos que começam com #
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();

          const headerHeight = elements.header ? elements.header.offsetHeight : 72;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerHeight - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Atualiza URL sem causar jump (boa prática)
          if (history.pushState) {
            history.pushState(null, null, `#${targetId}`);
          }
        }
      });
    });
  }

  // ==========================================
  // 4. SCROLL REVEAL (Intersection Observer)
  // ==========================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window) || revealElements.length === 0) {
      // Fallback: mostra tudo imediatamente se não suportar
      revealElements.forEach(el => el.classList.add('active'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Desconecta após revelar (performance)
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.revealThreshold,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // 5. BOTÃO VOLTAR AO TOPO
  // ==========================================
  function initBackToTop() {
    const btn = elements.backToTopBtn;
    if (!btn) return;

    // Mostra/esconde conforme scroll
    const toggleVisibility = () => {
      if (window.scrollY > CONFIG.backToTopThreshold) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Ação de clique com scroll suave
    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // Foco no topo para acessibilidade
      setTimeout(() => {
        const firstFocusable = document.querySelector('header a, header button');
        if (firstFocusable) firstFocusable.focus();
      }, 600);
    });

    // Inicializa estado
    toggleVisibility();
  }

  // ==========================================
  // 6. ALTERNÂNCIA DE TEMA (DARK / LIGHT)
  // ==========================================
  function initThemeToggle() {
    const toggleBtn = elements.themeToggle;
    const icon = elements.themeIcon;
    if (!toggleBtn || !icon) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Define o tema inicial
    function setTheme(theme, save = true) {
      elements.html.setAttribute('data-theme', theme);

      // Atualiza ícone (lua = dark, sol = light)
      if (theme === 'dark') {
        icon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
        toggleBtn.setAttribute('aria-label', 'Ativar tema claro');
      } else {
        icon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
        toggleBtn.setAttribute('aria-label', 'Ativar tema escuro');
      }

      if (save) {
        localStorage.setItem('portfolio-theme', theme);
      }
    }

    // Carrega tema salvo ou detecta preferência do sistema
    function loadInitialTheme() {
      const savedTheme = localStorage.getItem('portfolio-theme');

      if (savedTheme) {
        setTheme(savedTheme, false);
      } else {
        // Respeita prefers-color-scheme
        const systemTheme = prefersDark.matches ? 'dark' : 'light';
        setTheme(systemTheme, false);
      }
    }

    // Toggle manual
    toggleBtn.addEventListener('click', () => {
      const current = elements.html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });

    // Reage a mudanças na preferência do sistema (se usuário não escolheu manualmente)
    prefersDark.addEventListener('change', (e) => {
      if (!localStorage.getItem('portfolio-theme')) {
        setTheme(e.matches ? 'dark' : 'light', false);
      }
    });

    // Inicializa
    loadInitialTheme();
  }

  // ==========================================
  // 7. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
  // ==========================================
  function initFormValidation() {
    const form = elements.contactForm;
    const successMsg = elements.formSuccess;

    if (!form || !successMsg) return;

    const fields = {
      name: {
        input: document.getElementById('name'),
        error: document.getElementById('name-error'),
        validate: (val) => {
          if (!val || val.trim().length < 3) {
            return 'Por favor, informe seu nome completo.';
          }
          return null;
        }
      },
      email: {
        input: document.getElementById('email'),
        error: document.getElementById('email-error'),
        validate: (val) => {
          if (!val || val.trim() === '') {
            return 'Por favor, informe seu email.';
          }
          // Regex simples e eficaz para email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) {
            return 'Por favor, informe um email válido.';
          }
          return null;
        }
      },
      message: {
        input: document.getElementById('message'),
        error: document.getElementById('message-error'),
        validate: (val) => {
          if (!val || val.trim().length < 20) {
            return 'A mensagem deve ter pelo menos 20 caracteres.';
          }
          return null;
        }
      }
    };

    // Limpa erro de um campo específico
    function clearError(fieldName) {
      const field = fields[fieldName];
      if (field && field.error) {
        field.error.textContent = '';
        field.input.setAttribute('aria-invalid', 'false');
      }
    }

    // Mostra erro
    function showError(fieldName, message) {
      const field = fields[fieldName];
      if (field && field.error) {
        field.error.textContent = message;
        field.input.setAttribute('aria-invalid', 'true');
        field.input.focus();
      }
    }

    // Validação em tempo real (blur e input)
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      if (!field.input) return;

      // Valida ao sair do campo
      field.input.addEventListener('blur', () => {
        const error = field.validate(field.input.value);
        if (error) {
          showError(fieldName, error);
        } else {
          clearError(fieldName);
        }
      });

      // Limpa erro enquanto digita
      field.input.addEventListener('input', () => {
        if (field.error && field.error.textContent) {
          clearError(fieldName);
        }
      });
    });

    // Submissão do formulário
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;
      const formData = {};

      // Valida todos os campos
      Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        const value = field.input ? field.input.value : '';
        const error = field.validate(value);

        if (error) {
          showError(fieldName, error);
          isValid = false;
        } else {
          clearError(fieldName);
          formData[fieldName] = value.trim();
        }
      });

      if (!isValid) {
        // Foca no primeiro campo com erro
        const firstErrorField = Object.keys(fields).find(name => {
          return fields[name].error && fields[name].error.textContent !== '';
        });
        if (firstErrorField && fields[firstErrorField].input) {
          fields[firstErrorField].input.focus();
        }
        return;
      }

      // Simulação de envio (sem backend real - conforme natureza estática do portfólio)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      // Simula latência de rede
      setTimeout(() => {
        // Esconde formulário e mostra mensagem de sucesso
        form.style.display = 'none';
        successMsg.hidden = false;
        successMsg.setAttribute('aria-live', 'polite');

        // Opcional: log para debug (não envia dados reais)
        console.log('%c[Portfolio] Formulário validado com sucesso (simulado):', 'color:#6e6b4e', formData);

        // Restaura botão (caso usuário queira reenviar depois)
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }

        // Foca na mensagem de sucesso para leitores de tela
        successMsg.focus?.();

        // Permite resetar o formulário após alguns segundos (botão implícito)
        setTimeout(() => {
          const resetNote = document.createElement('button');
          resetNote.type = 'button';
          resetNote.className = 'btn btn-secondary';
          resetNote.style.marginTop = 'var(--spacing-md)';
          resetNote.textContent = 'Enviar outra mensagem';
          resetNote.addEventListener('click', () => {
            successMsg.hidden = true;
            form.style.display = '';
            form.reset();
            // Limpa todos os erros
            Object.keys(fields).forEach(clearError);
            resetNote.remove();
          });
          successMsg.appendChild(resetNote);
        }, 6500);

      }, 850); // tempo realista de "envio"
    });
  }

  // ==========================================
  // 8. NAVEGAÇÃO ATIVA (OPCIONAL - BÔNUS DE UX)
  // ==========================================
  function initActiveNavOnScroll() {
    const sections = document.querySelectorAll('main section[id]');
    if (sections.length === 0 || elements.navLinks.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -40% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // ==========================================
  // 9. INICIALIZAÇÃO GERAL
  // ==========================================
  function init() {
    // Garante que o tema seja aplicado o mais cedo possível (já feito no HTML via data-theme)
    // Inicializa todas as funcionalidades
    initTypingEffect();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initBackToTop();
    initThemeToggle();
    initFormValidation();
    initActiveNavOnScroll();

    // Mensagem de boas-vindas no console (apenas desenvolvimento)
    console.log('%c[Portfolio] Portfólio de Emanoel Cariolando inicializado com sucesso. Design System + todas as funcionalidades ativas.', 'color:#868469; font-size: 9px');
  }

  // Aguarda DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expõe API mínima para debug (opcional)
  window.PortfolioDebug = {
    resetTheme: () => {
      localStorage.removeItem('portfolio-theme');
      location.reload();
    }
  };

})();
