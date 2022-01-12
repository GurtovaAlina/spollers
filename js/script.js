"use strict"

// SPOILERS
const spollersArray = document.querySelectorAll('[data-spollers]'); //получаем коллекцию
//проверяем их наличие
if (spollersArray.length > 0) { 
    // получение обычных спойлеров
    // переводим коллекцию в массив, фильтруем
    const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
        // ищем атрибуты data-spollers без параметров, преобразовуем в массив
        return !item.dataset.spollers.split(",")[0];
    });
    // инициализация обычных спойлеров
    if (spollersRegular.length > 0) {
        initSpollers(spollersRegular);
    }



    // получение спойлеров с медиа запросами
    const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
        // ищем атрибуты data-spollers c параметрами(ширина), преобразовуем в массив
        return item.dataset.spollers.split(",")[0];
    });


    // инициализация спойлеров с медиа запросами
    // делаем проверку на наличие
    if (spollersMedia.length > 0) {
        // создаём пустой массив
        const breakpointsArray = [];
        // перебераем массив с медиа запросами
        spollersMedia.forEach(item => {
            // получаем строку с параметрами каждого объекта
            const params = item.dataset.spollers;
            // создаём пустой объект
            const breakpoint = {};
            // преабразовуем строку params в массив paramsArray
            const paramsArray = params.split(",");
            // получаем парамерты (ширина)
            breakpoint.value = paramsArray[0];
            // получаем парамерты (min/max, по умолчанию max)
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            // присваиваем в параметры объект
            breakpoint.item = item;
            // объект передаём в массив
            breakpointsArray.push(breakpoint);
        });
    


        // получаем уникальные брейк поинты (на случай одинаковых условий для спойлеров(коробок))
        // переделываем массив breakpointsArray
        let mediaQueries = breakpointsArray.map(function (item) {
            // собираем строку с медиа запросом
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
        });
            //присваиваем строку в переменную(массив), фильтруем
        mediaQueries = mediaQueries.filter(function (item, index, self) {
            //возвращаем уникальные значения
            return self.indexOf(item) === index;
        });


        // работа с каждым брейкпоинтом
        //пробегаемся 
        mediaQueries.forEach(breakpoint => {
            //получаем строку и преобразовуем её в массив
            const paramsArray = breakpoint.split(",");
            // получаем первый параметр - ширина
            const mediaBreakpoint = paramsArray[1];
            // получаем парамерт min/max
            const mediaType = paramsArray[2];
            // метод (слушает ширину єкрана) который будет отрабатывать, 
            // если сработал брейкпоинт,  в скобках строка которую собирали
            const matchMedia = window.matchMedia(paramsArray[0]);

            // объект с нужными условиями
            // собираем объекты с нужными условиями
            const spollersArray = breakpointsArray.filter(function (item) {
                // проверяем совпадают условия брейкпоинт и тип брейкпоинта
                if (item.value === mediaBreakpoint && item.type === mediaType) {
                    // если совпадают берём в массив
                    return true;
                }
            });

            
            // инициализация
            // запускаем при событии 
            matchMedia.addListener(function () {
                initSpollers(spollersArray, matchMedia);
            });
            // просто запускаем, чтобы отработала при загрузке страницы
            initSpollers(spollersArray, matchMedia);
        });
    }



    // Функция инициализации
    // передаем массив и медиазапрос(по умолчанию false)
    function initSpollers(spollersArray, matchMedia = false) {
        // делаем проверку
        spollersArray.forEach(spollersBlock => {
            // если медиазапрос не равно false, то присваиваем имя объекту
            spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
            // если брейкпоинт сработал 
            if (matchMedia.matches || !matchMedia) {
                // добавляем класс
                spollersBlock.classList.add('_init');
                // отвечает за контентную часть
                initSpollerBody(spollersBlock); 
                spollersBlock.addEventListener("click", setSpollerAction);
            } else {
                spollersBlock.classList.remove('_init');
                initSpollerBody(spollersBlock, false);
                spollersBlock.addEventListener("click", setSpollerAction);
            }
        });
    }


    // работа с контетом
    function initSpollerBody(spollersBlock, hideSpollerBody = true) {
        // получаем все заголовки спойлеров 
        const spollerTitle = spollersBlock.querySelectorAll('[data-spoller]');
        // проверяем их наличие
        if (spollerTitle.length > 0) {
            // пробегаемся по каждому
            spollerTitle.forEach(spollerTitle => {
                if (hideSpollerBody) {
                    // убираем tabindex, чтобы можно было кликать табом
                    spollerTitle.removeAttribute('tabindex');
                    // если у заголовка нет класса _active
                    if (!spollerTitle.classList.contains('_active')) {
                        // тогда мы скрываем контентную часть (следующий элемент после заголовка)
                        // бывает, что спойлер показывают сразу
                        spollerTitle.nextElementSibling.hidden = true;
                    }
                } else {
                    // для брейкпоинтов (превращаем спойлер в обычный блок)
                    spollerTitle.setAttribute('tabindex', '-1');
                    spollerTitle.nextElementSibling.hidden = false;
                }
            });
        }
    }

    // функция выполняется при клике на заголовок (делегирование событий)
    function setSpollerAction (e) {
        // получаем нажатый объект
        const el = e.target;
        // проверяем на наличие атрибута data-spoller
        if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
            // получаем кнопку
            const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
            // получаем родительский блок
            const spollersBlock = spollerTitle.closest('[data-spollers]');
            // проверка, нужно ли добавлять функционал аккордиона
            const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
            // проверяем, есть ли внутри объекта _slide
            if (!spollersBlock.querySelectorAll('._slide').length) {
                // проверка на функционал аккордиона
                // если есть data-one-spoller и у нажатой кнопки есть _active
                if (oneSpoller && !spollerTitle.classList.contains('_active')) {
                    // все остальные спойлеры скрыть
                    hideSpollerBody(spollersBlock);
                }
                spollerTitle.classList.toggle('_active');
                _slideToggle(spollerTitle.nextElementSibling, 500);
            }
            e.preventDefault();
        }
    }

    // функция для аккордиона
    function hideSpollerBody (spollersBlock) {
        // получаем открытый спойлер
        const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');
        if (spollerActiveTitle) {
            // убираем класс
            spollerActiveTitle.classList.remove('_active');
            // скрываем все элементы
            _slideUp(spollerActiveTitle.nextElementSibling, 500);
        }
    }
}


// SlideToggle

let _slideUp = (target, duration = 500) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = target.offsetHeight + 'px';
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        window.setTimeout(() => {
            target.hidden = true;
            target.style.removeProperty('height');
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
}

let _slideDown = (target, duration = 500) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        if (target.hidden) {
            target.hidden = false;
        }
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        target.offsetHeight;
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
}

let _slideToggle = (target, duration = 500) => {
    if (target.hidden) {
        return _slideDown(target, duration);
    } else {
        return _slideUp(target, duration);
    }
}

    
    
   




/*
Для родителя спойлера пишем атрибут data-spollers
Для заголовков (кнопки) спойлера пишем атрибут data-spoller

Если нужно включать/выключать работу спойлеров на разных экранов 
пишем параметры ширины и типа брейкпоинта
Например:
data-spollers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
data-spollers="768,min" - спойлеры будут работать только на экранах больше или равно 768px

Если нужно что бы в блоке открывался только один спойлер добавляем атрибут data-one-spoller
*/