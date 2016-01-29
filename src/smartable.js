var Smartable = {
    create: function (id, params) {
        var instance = {
            TYPE_FUNCTION: 'function',
            TYPE_UNDEFINED: 'undefined',

            ATTR_PAGE: 'data-smartable-page',
            ATTR_SORT: 'data-smartable-sort',
            ATTR_SORT_VALUE: 'data-smartable-sort-value',
            ATTR_FILTERED: 'data-smartable-filtered',
            ATTR_POSITION: 'data-smartable-position',

            CLASS_BASE: 'b-smartable',
            CLASS_SORT: 'b-smartable__sort',
            CLASS_SORT_DESC: 'b-smartable__sort_desc',
            CLASS_SORT_ASC: 'b-smartable__sort_asc',
            CLASS_TABLE: 'b-smartable__table',
            CLASS_EMPTY: '',
            CLASS_SEARCH: 'b-smartable__search',
            CLASS_INPUT: 'b-smartable__input',
            CLASS_SHOWING: 'b-smartable__showing',
            CLASS_PAGER: 'b-smartable__pager',

            HTML_HEAD: 'thead',
            HTML_BODY: 'tbody',
            HTML_BLOCK: 'div',
            HTML_ROW: 'tr',
            HTML_CELL: 'td',
            HTML_INPUT: 'input',
            HTML_HEADER_CELL: 'th',

            NODE_TEXT: '#text',
            NODE_TYPE_TEXT: 'text',

            PROP_SHOW: '',
            PROP_HIDE: 'none',

            FILTERED_TRUE: 'yes',
            FILTERED_FALSE: 'no',

            id: '',

            items: 0,
            limit: 25,
            pages: 0,
            page: 1,
            sort: {column: 0, desc: false},
            sortAttribute: '',

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
             * @param func
             * @returns {boolean}
             */
            isFunction: function (func) {
                return typeof(func) == this.TYPE_FUNCTION;
            },

            /**
             *
             * @param data
             * @returns {boolean}
             */
            isUndefined: function (data) {
                return typeof(data) == this.TYPE_UNDEFINED;
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
                if (this.isUndefined(params)) {
                    return false;
                }

                if (!this.isUndefined(params.limit) && !isNaN(parseInt(params.limit))) {
                    this.limit = params.limit;
                }

                if (!this.isUndefined(params.sortAttribute)) {
                    this.sortAttribute = params.sortAttribute;
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
                } else if (this.html.table.className.indexOf(this.CLASS_TABLE) == -1) {
                    this.html.table.className += ' ' + this.CLASS_TABLE;
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
                var head = this.searchHtmlElements(this.html.table, this.HTML_HEAD);

                if (!this.isUndefined(head) && !this.isUndefined(head[0])) {
                    this.html.tableHead = head[0];

                    var th = this.searchHtmlElements(this.html.tableHead, this.HTML_HEADER_CELL);

                    for (var i in th) {
                        if (th.hasOwnProperty(i)) {
                            th[i].setAttribute(this.ATTR_SORT, i);
                            th[i].className = this.CLASS_SORT;

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
                var body = this.searchHtmlElements(this.html.table, this.HTML_BODY);

                if (!this.isUndefined(body) && !this.isUndefined(body[0])) {
                    this.html.tableBody = body[0];

                    var rows = this.searchHtmlElements(this.html.tableBody, this.HTML_ROW);

                    for (var i in rows) {
                        if (rows.hasOwnProperty(i)) {
                            rows[i].setAttribute(this.ATTR_POSITION, i);
                            rows[i].setAttribute(this.ATTR_FILTERED, this.FILTERED_FALSE);

                            rows[i].cells = this.searchHtmlElements(rows, this.HTML_CELL);

                            this.html.rows.push(rows[i]);
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
                    if(this.html.rows.hasOwnProperty(j)) {
                        this.html.tableBody.appendChild(this.html.rows[j]);
                    }
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

                    if (self.getHtmlAttribute(t, self.ATTR_PAGE) != null) {
                        self.toPage(self.getHtmlAttribute(t, self.ATTR_PAGE));
                    } else if (self.getHtmlAttribute(t, self.ATTR_SORT) != null) {
                        self.setSort(self.getHtmlAttribute(t, self.ATTR_SORT));
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

                if (!this.isUndefined(className)) {
                    domElement.className = className;
                }

                if (!this.isUndefined(attributes)) {
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
             * @param node
             * @param attribute
             * @returns {String|null}
             */
            getHtmlAttribute: function (node, attribute) {
                if (!this.isUndefined(node) && !this.isUndefined(node.getAttribute)) {
                    return node.getAttribute(attribute);
                }

                return null;
            },

            /**
             *
             * @param node
             * @param tag
             * @returns {Array}
             */
            searchHtmlElements: function (node, tag) {
                var htmlElements = [];

                if (!this.isUndefined(node.childNodes)) {
                    for (var i in node.childNodes) {
                        if (node.childNodes.hasOwnProperty(i) && !this.isUndefined(node.childNodes[i].tagName)) {
                            if (node.childNodes[i].tagName.toLowerCase() == tag) {
                                htmlElements.push(node.childNodes[i]);
                            } else {
                                var childs = this.searchHtmlElements(node.childNodes[i], tag);

                                if (childs.length > 0) {
                                    for (var j in childs) {
                                        if (childs.hasOwnProperty(j)) {
                                            htmlElements.push(childs[j]);
                                        }
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

                if (!this.isUndefined(node.childNodes)) {
                    for (var i in node.childNodes) {
                        if (node.childNodes.hasOwnProperty(i) && !this.isUndefined(node.childNodes[i].nodeName)) {
                            if (node.childNodes[i].nodeName.toLowerCase() == this.NODE_TEXT) {
                                textElements.push(node.childNodes[i].nodeValue.replace(/(\r\n|\r|\n|\t|\s)+/g, ' '));
                            } else {
                                var childs = this.searchTextElements(node.childNodes[i]);

                                if (childs.length > 0) {
                                    for (var j in childs) {
                                        if (childs.hasOwnProperty(j)) {
                                            textElements.push(childs[j]);
                                        }
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
                this.html.container = this.createHtmlElement(this.HTML_BLOCK, this.CLASS_EMPTY);

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
                var searchBlock = this.createHtmlElement(this.HTML_BLOCK, this.CLASS_SEARCH);

                this.html.search = this.createHtmlElement(this.HTML_INPUT, this.CLASS_INPUT, {'type': this.NODE_TYPE_TEXT});

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
                this.html.showing = this.createHtmlElement(this.HTML_BLOCK, this.CLASS_SHOWING);
                this.html.pager = this.createHtmlElement(this.HTML_BLOCK, this.CLASS_PAGER);

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

                        var attr = filter ? this.FILTERED_TRUE : this.FILTERED_FALSE;

                        this.html.rows[i].setAttribute(this.ATTR_FILTERED, attr);

                        if (show && !filter) {
                            this.html.rows[i].style.display = this.PROP_SHOW;
                        } else {
                            this.html.rows[i].style.display = this.PROP_HIDE;
                        }

                        if (!filter) {
                            this.items++;
                        }
                    }
                }

                return true;
            },

            /**
             * @todo refactor
             */
            drawPager: function () {
                var bttns = this.createPagerButtons(),
                    buttons = [];

                buttons.push('<li"><a ' + this.ATTR_PAGE + '="' + (this.page - 1) + '">&laquo;</a></li>');

                for (var i in bttns) {
                    if (bttns.hasOwnProperty(i)) {
                        if (bttns[i] == '') {
                            buttons.push('<li"><span>...</span></li>');
                        } else if (this.page == bttns[i]) {
                            buttons.push('<li class="active"><span>' + bttns[i] + '</span></li>');
                        } else {
                            buttons.push('<li><a ' + this.ATTR_PAGE + '="' + bttns[i] + '">' + bttns[i] + '</a></li>');
                        }
                    }
                }

                buttons.push('<li"><a ' + this.ATTR_PAGE + '="' + (this.page + 1) + '">&raquo;</a></li>');

                this.html.pager.innerHTML = '<ul>' + buttons.join('') + '</ul>';
            },

            /**
             * @todo refactor
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
                if (this.isFunction(this.filter)) {
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
                if (!this.isFunction(func)) {
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

                for (var i in this.html.columns) {
                    if (this.html.columns.hasOwnProperty(i)) {
                        this.html.columns[i].className = this.CLASS_SORT;

                        if (i == column) {
                            var className = this.sort.desc ? this.CLASS_SORT_DESC : this.CLASS_SORT_ASC;

                            this.html.columns[i].className += ' ' + className;
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
                    var nodeA = a.cells[self.sort.column], nodeB = b.cells[self.sort.column], valueA, valueB,
                        asc = self.sort.desc ? -1 : 1, desc = self.sort.desc ? 1 : -1,
                        sortAttribute = self.sortAttribute != '' ? self.sortAttribute : self.ATTR_SORT_VALUE;

                    valueA = self.getHtmlAttribute(nodeA, sortAttribute);
                    valueB = self.getHtmlAttribute(nodeB, sortAttribute);

                    if (valueA == null && valueB == null) {
                        valueA = self.searchTextElements(nodeA).join(' ').replace(/_/g, '');
                        valueB = self.searchTextElements(nodeB).join(' ').replace(/_/g, '');
                    }

                    if (!isNaN(valueA) && !isNaN(valueB)) {
                        valueA = parseFloat(valueA);
                        valueB = parseFloat(valueB);
                    }

                    return (valueA < valueB) ? desc : ((valueA > valueB) ? asc : 0);
                });

                return true;
            }
        };

        instance.init(id, params);

        return instance;
    }
};