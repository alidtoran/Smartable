/*! Smartable
 * ©2015 TORan
 */

var Smartable = {
    create: function (id, params) {
        var instance = {
            id: '',

            items: 0,
            limit: 25,
            pages: 0,
            page: 1,
            sort: {column: 0, desc: false},

            filter: null,
            search: '',

            text: {
                search: 'Search: ',
                showing: ''
            },

            html: {
                container: null,
                table: null,
                tableHead: null,
                tableBody: null,

                showing: null,
                pager: null,
                columns: [],
                rows: []
            },

            /**
             *
             * @param id
             * @param params
             * @returns {boolean}
             */
            init: function (id, params) {
                this.id = id;

                this.initParams(params);

                if (this.initHtml()) {
                    this.initEvents();

                    this.drawTable();
                }

                return true;
            },

            /**
             *
             * @param params
             * @returns {boolean}
             */
            initParams: function (params) {
                if (typeof(params) == 'undefined') {
                    return false;
                }

                if (typeof(params.limit) != 'undefined' && !isNaN(parseInt(params.limit))) {
                    this.limit = params.limit;
                }

                return true;
            },

            /**
             *
             * @returns {boolean}
             */
            initHtml: function () {
                this.html.table = document.getElementById(this.id);

                if (this.html.table == null) {
                    return false;
                } else if (this.html.table.className.indexOf('b-smartable__table') == -1) {
                    this.html.table.className += ' b-smartable__table';
                }

                if (!this.initColumns() || !this.initRows()) {
                    return false;
                }

                return this.drawHtml();
            },

            /**
             *
             * @returns {boolean}
             */
            initColumns: function () {
                var head = this.searchHtmlElements(this.html.table, 'thead');

                if (typeof(head) != 'undefined' && typeof(head[0]) != 'undefined') {
                    this.html.tableHead = head[0];

                    var th = this.searchHtmlElements(this.html.tableHead, 'th');

                    for (var i in th) {
                        if (th.hasOwnProperty(i)) {
                            th[i].setAttribute('data-sort', i);
                            th[i].className = 'b-smartable__sort';

                            this.html.columns.push(th[i]);
                        }
                    }

                    return true;
                }

                return false;
            },

            /**
             *
             * @returns {boolean}
             */
            initRows: function () {
                var body = this.searchHtmlElements(this.html.table, 'tbody');

                if (typeof(body) != 'undefined' && typeof(body[0]) != 'undefined') {
                    this.html.tableBody = body[0];

                    var tr = this.searchHtmlElements(this.html.tableBody, 'tr');

                    for (var i in tr) {
                        if (tr.hasOwnProperty(i)) {
                            tr[i].setAttribute('data-pos', i);
                            tr[i].setAttribute('data-filtered', 'no');

                            tr[i].cells = this.searchHtmlElements(this.html.tableBody, 'td');

                            this.html.rows.push(tr[i]);
                        }
                    }

                    return true;
                }

                return false;
            },

            /**
             *
             * @returns {boolean}
             */
            reorderRows: function () {
                for (var i = this.html.rows.length - 1; i >= 0; i--) {
                    this.html.tableBody.removeChild(this.html.rows[i]);
                }

                for (var j in this.html.rows) {
                    this.html.tableBody.appendChild(this.html.rows[j]);
                }

                return true;
            },

            /**
             *
             */
            initEvents: function () {
                var self = this;

                this.html.container.onclick = function (event) {
                    var e = event || window.event,
                        t = e.target || e.srcElement;

                    if (typeof(t) != 'undefined' && typeof(t.getAttribute) != 'undefined') {
                        if (t.getAttribute('data-page') != null) {
                            self.toPage(t.getAttribute('data-page'));
                        } else if (t.getAttribute('data-sort') != null) {
                            self.setSort(t.getAttribute('data-sort'));
                        }
                    }
                };

                this.html.search.onkeyup = function () {
                    self.searchText();
                };

                this.html.search.onchange = function () {
                    self.searchText();
                };
            },

            /**
             *
             * @param tag
             * @param className
             * @param attributes
             */
            createHtmlElement: function (tag, className, attributes) {
                var domElement = document.createElement(tag);

                if (typeof(className) != 'undefined') {
                    domElement.className = 'b-smartable' + (className != '' ? '__' : '') + className;
                }

                if (typeof(attributes) != 'undefined') {
                    for (var i in attributes) {
                        if (attributes.hasOwnProperty(i)) {
                            domElement.setAttribute(i, attributes[i]);
                        }
                    }
                }

                return domElement;
            },

            /**
             *
             * @param parent
             * @returns {Array}
             */
            searchHtmlElements: function (node, tag) {
                var htmlElements = [];

                if (typeof(node.childNodes) != 'undefined') {
                    for (var i in node.childNodes) {
                        if (node.childNodes.hasOwnProperty(i) && typeof(node.childNodes[i].tagName) != 'undefined') {
                            if (node.childNodes[i].tagName.toLowerCase() == tag) {
                                htmlElements.push(node.childNodes[i]);
                            } else {
                                var childs = this.searchHtmlElements(node.childNodes[i], tag);

                                if (childs.length > 0) {
                                    for (var j in childs) {
                                        htmlElements.push(childs[j]);
                                    }
                                }
                            }
                        }
                    }
                }

                return htmlElements;
            },

            /**
             *
             * @param text
             * @returns {Text}
             */
            createTextElement: function (text) {
                return document.createTextNode(text);
            },

            /**
             *
             * @param node
             * @returns {Array}
             */
            searchTextElements: function (node) {
                var textElements = [];

                if (typeof(node.childNodes) != 'undefined') {
                    for (var i in node.childNodes) {
                        if (node.childNodes.hasOwnProperty(i) && typeof(node.childNodes[i].nodeName) != 'undefined') {
                            if (node.childNodes[i].nodeName.toLowerCase() == '#text') {
                                textElements.push(node.childNodes[i].nodeValue.replace(/(\r\n|\r|\n|\t|\s)+/g, ' '));
                            } else {
                                var childs = this.searchTextElements(node.childNodes[i]);

                                if (childs.length > 0) {
                                    for (var j in childs) {
                                        textElements.push(childs[j]);
                                    }
                                }
                            }
                        }
                    }
                }

                return textElements;
            },


            /**
             *
             * @returns {boolean}
             */
            drawHtml: function () {
                this.html.container = this.createHtmlElement('div', '');

                this.html.table.parentNode.insertBefore(this.html.container, this.html.table);

                this.drawHeaderHtml();

                this.html.container.appendChild(this.html.table);

                this.drawFooterHtml();

                return true;
            },

            /**
             *
             * @returns {boolean}
             */
            drawHeaderHtml: function () {
                var searchBlock = this.createHtmlElement('div', 'search');

                this.html.search = this.createHtmlElement('input', 'input', {'type': 'text'});

                searchBlock.appendChild(this.createTextElement(this.text.search));
                searchBlock.appendChild(this.html.search);

                this.html.container.appendChild(searchBlock);

                return true;
            },

            /**
             *
             * @returns {boolean}
             */
            drawFooterHtml: function () {
                this.html.showing = this.createHtmlElement('div', 'showing');
                this.html.pager = this.createHtmlElement('div', 'pager');

                this.html.container.appendChild(this.html.pager);
                this.html.container.appendChild(this.html.showing);

                return true;
            },

            /**
             *
             */
            drawTable: function () {
                this.drawRows();

                this.drawPager();

                this.drawShowing();

                return true;
            },

            /**
             *
             * @returns {boolean}
             */
            drawRows: function () {
                var firstElement = this.limit * (this.page - 1),
                    lastElement = this.limit * this.page;

                this.items = 0;

                for (var i in this.html.rows) {
                    if (this.html.rows.hasOwnProperty(i)) {
                        var filter = this.filterRow(this.html.rows[i]) || !this.searchRow(this.html.rows[i]),
                            show = this.items >= firstElement && this.items < lastElement;

                        this.html.rows[i].setAttribute('data-filtered', (filter ? 'yes' : 'no'));

                        if (show && !filter) {
                            this.html.rows[i].style.display = '';
                        } else {
                            this.html.rows[i].style.display = 'none';
                        }

                        if (!filter) {
                            this.items++;
                        }
                    }
                }

                return true;
            },

            /**
             *
             */
            drawPager: function () {
                var bttns = this.createPagerButtons(),
                    buttons = [];

                buttons.push('<li"><a data-page="' + (this.page - 1) + '">&laquo;</a></li>');

                for (var i in bttns) {
                    if (bttns.hasOwnProperty(i)) {
                        if (bttns[i] == '') {
                            buttons.push('<li"><span>...</span></li>');
                        } else if (this.page == bttns[i]) {
                            buttons.push('<li class="active"><span>' + bttns[i] + '</span></li>');
                        } else {
                            buttons.push('<li><a data-page="' + bttns[i] + '">' + bttns[i] + '</a></li>');
                        }
                    }
                }

                buttons.push('<li"><a data-page="' + (this.page + 1) + '">&raquo;</a></li>');

                this.html.pager.innerHTML = '<ul>' + buttons.join('') + '</ul>';
            },

            /**
             *
             * @returns {Array}
             */
            createPagerButtons: function () {
                this.pages = this.items / this.limit;
                this.pages = (parseInt(this.pages) < this.pages) ? parseInt(this.pages) + 1 : this.pages;
                this.pages = (this.pages == 0) ? 1 : this.pages;

                var buttons = [],
                    first = this.page < 5 || this.pages <= 7,
                    last = this.page > this.pages - 4 || this.pages <= 7;

                buttons.push(1);
                (this.pages > 1) && (buttons.push(first ? '2' : ''));
                (this.pages > 2) && (buttons.push(first ? '3' : (last ? this.pages - 4 : this.page - 1)));
                (this.pages > 3) && (buttons.push(first ? '4' : (last ? this.pages - 3 : this.page)));
                (this.pages > 4) && (buttons.push(first ? '5' : (last ? this.pages - 2 : this.page + 1)));
                (this.pages > 6) && (buttons.push(last ? this.pages - 1 : ''));
                (this.pages >= 6) && (buttons.push(this.pages));

                return buttons;
            },

            /**
             *
             */
            drawShowing: function () {
                var show = this.items > this.limit ? (this.limit * (this.page - 1) + 1) : this.items,
                    to = this.items > this.limit ? this.limit * this.page : this.items,
                    of = this.items;

                this.html.showing.innerHTML = 'Showing ' + show + ' to ' + to + ' of ' + of + ' entries';

                this.html.showing.appendChild(this.createTextElement(this.text.search));

                if (this.items < this.html.rows.length) {
                    this.html.showing.innerHTML += '  (filtered from ' + this.html.rows.length + ' total entries)';
                }
            },

            /**
             *
             * @param row
             * @returns {boolean}
             */
            filterRow: function (row) {
                if (typeof(this.filter) == 'function') {
                    return this.filter(row) === true;
                }

                return false;
            },

            /**
             *
             * @param row
             * @returns {boolean}
             */
            searchRow: function (row) {
                return row.innerHTML.indexOf(this.search) != -1;
            },

            /**
             *
             * @param page
             * @returns {boolean}
             */
            toPage: function (page) {
                page = parseInt(page);

                if (!isNaN(page) && page > 0 && page <= this.pages) {
                    this.page = page;

                    this.drawTable();
                }

                return false;
            },

            /**
             *
             * @returns {boolean}
             */
            searchText: function () {
                this.search = this.html.search.value;

                return this.toPage(1);
            },

            /**
             *
             * @param filter
             * @returns {boolean}
             */
            setFilter: function (filter) {
                this.filter = filter;

                return this.toPage(1);
            },

            /**
             *
             * @param func
             * @returns {boolean}
             */
            eachRow: function (func) {
                if (typeof(func) != 'function') {
                    return false;
                }

                for (var i in this.html.rows) {
                    if (this.html.rows.hasOwnProperty(i)) {
                        func(i, this.html.rows[i]);
                    }
                }

                return true;
            },

            /**
             *
             * @param column
             * @returns {*}
             */
            setSort: function (column) {
                this.sort = {column: column, desc: !((this.sort.column == column) ? this.sort.desc : true)};

                for(var i in this.html.columns) {
                    if(this.html.columns.hasOwnProperty(i)) {
                        this.html.columns[i].className = 'b-smartable__sort';

                        if(i == column) {
                            this.html.columns[i].className += ' b-smartable__sort_' + (this.sort.desc ? 'desc' : 'asc');
                        }
                    }
                }

                this.sortRows();

                this.reorderRows();

                return this.drawTable();
            },

            /**
             *
             * @returns {boolean}
             */
            sortRows: function () {
                var self = this;

                this.html.rows.sort(function (a, b) {
                    var a = self.searchTextElements(a.cells[self.sort.column]).join(' ').replace(/_/g, ''),
                        b = self.searchTextElements(b.cells[self.sort.column]).join(' ').replace(/_/g, ''),
                        asc = self.sort.desc ? -1 : 1,
                        desc = self.sort.desc ? 1 : -1;

                    if (!isNaN(a) && !isNaN(b)) {
                        a = parseFloat(a);
                        b = parseFloat(b);
                    }

                    return (a < b) ? desc : ((a > b) ? asc : 0);
                });

                return true;
            }
        };

        instance.init(id, params);

        return instance;
    }
};