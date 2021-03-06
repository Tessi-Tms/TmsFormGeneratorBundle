
// FormField

function FormField($field, ajaxUrl, ajaxLoaderPath) {
    this.$field = $field;
    this.ajaxUrl = ajaxUrl;
    this.ajaxLoaderPath = ajaxLoaderPath;
    this.$type = this.$field.find('.form_field_type_choice');
    this.$options = this.$field.find('.tms_form_generator_form_field_options');
    this.id = this.$options.attr('id');
    this.init();
}

FormField.prototype.init = function() {

    if (this.$type.length  == 0) {
        return false;
    }

    this.displayTab();
    this.loadData(this.$type.val());

    var that = this;
    this.$type.on('change', function(event) {
        event.preventDefault();
        that.loadData($(this).val());
    });
}

FormField.prototype.displayTab = function() {
    var $tab = $('<ul class="nav nav-tabs" id="'+this.id+'_form_field_tab"></ul>');
    var $tabContent = $('<div class="tab-content"></div>');

    this.$field.append($tab);
    this.$field.append($tabContent);

    this.$field.find('.totab').each(function() {
        var $fieldset = $(this).closest('fieldset');
        var name = $fieldset.find('> span > label').text();
        var $tabItem = $('<li><a href="#'+$(this).attr('id')+'_container">'+name+'</a></li>');
        $tab.append($tabItem);
        var $contentItem = $('<div class="tab-pane" id="'+$(this).attr('id')+'_container"></div>');
        $fieldset.find('> span').remove();
        $fieldset.detach();
        $contentItem.append($fieldset);
        $tabContent.append($contentItem);
        $tabItem.on('click', function(event) {
            event.preventDefault();
            $tabItem.toggleClass('active');
            $contentItem.toggleClass('active');
        });
    });
}

FormField.prototype.loadData = function(type) {
    var $container = this.$options.siblings('.tms_form_generator_form_field_container');
    if ($container.length) {
        $container.empty();
    } else {
        $container = $('<div class="tms_form_generator_form_field_container"></div>');
        this.$options.parent('.inputs').append($container);
    }

    var $ajaxLoader = $('<img src="'+this.ajaxLoaderPath+'" />');
    $container.append($ajaxLoader);
    this.$options.hide();
    var name = this.$options.attr('name');
    var data = this.$options.val();
    var id = this.id;

    var request = $.ajax({
        url: this.ajaxUrl,
        type: "POST",
        data: { name: this.id, type: type, data: btoa(unescape(encodeURIComponent(data))) },
        dataType: "html"
    });

    request.done(function(form) {
        var fields = $(form).html();
        var regExp = new RegExp('name="'+id, 'g')
        fields = fields.replace(regExp, 'name="'+name);
        var regExp = new RegExp('name=&quot;'+id, 'g')
        fields = fields.replace(regExp, 'name=&quot;'+name);
        $container.append(fields);
        $ajaxLoader.remove();
    });

    request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
    });
}


// FormFieldManager

function FormFieldManager($container) {
    this.$container = $container;
    this.initSortable();

    this.$container.append(this.createAddFieldLink());
    var that = this;
    this.$container.find('> fieldset').each(function() {
        $(this).append(that.createDeleteFieldLink());
    });
}

FormFieldManager.prototype.initSortable = function() {
    var that = this;
    this.$container.sortable({
        stop: function(e, ui) {
            that.updateFieldsetPosition();
        }
    });
}

FormFieldManager.prototype.updateFieldsetPosition = function() {
    var $container = this.$container
    containerId = $container.attr('id');
    regExp = new RegExp('[^_]*$', 'g');
    matches = regExp.exec(containerId);
    var formFieldName = matches[0];
    var formName = containerId.replace('_'+formFieldName, '');
    var checkedToKeep = {};

    $container.find('> fieldset').each(function(position) {
        var nameRegExp = new RegExp('('+formName+'\\['+formFieldName+'\\]\\[)([0-9]*)');
        var idRegExp = new RegExp('('+formName+'_'+formFieldName+'_)([0-9]*)');
        $(this).find('.inputs *').each(function() {
            _name = $(this).attr('name');
            _id = $(this).attr('id');
            _for = $(this).attr('for');

            if (_name && nameRegExp.test(_name)) {
                matches = _name.match(nameRegExp);
                if (matches[2] != position) {
                    var newName = _name.replace(nameRegExp, '$1'+position);
                    $container.find('> fieldset *[name="'+newName+'"]').each(function() {
                        if($(this).prop('checked')) {
                            checkedToKeep[$(this).attr('id')] = true;
                        }
                    });

                    $(this).attr('name', newName);
                    if(checkedToKeep[$(this).attr('id')]) {
                        $(this).prop('checked', true);
                    }
                }
            }

            if (_id && idRegExp.test(_id)) {
                matches = _id.match(idRegExp);
                if (matches[2] != position) {
                    var newId = _id.replace(idRegExp, '$1'+position);
                    $(this).attr('id', newId);
                }
            }

            if (_for && idRegExp.test(_for)) {
                matches = _for.match(idRegExp);
                if (matches[2] != position) {
                    var newFor = _for.replace(idRegExp, '$1'+position);
                    $(this).attr('for', newFor);
                }
            }
        });
    });
}

FormFieldManager.prototype.createAddFieldLink = function() {
    var $addLink = $('<a href="#" class="btn btn-primary add_field_link">Add field</a>');

    var that = this;
    $addLink.on('click', function(e) {
        e.preventDefault();
        that.updateFieldsetPosition();
        that.addField($(this));
    });

    return $addLink;
}

FormFieldManager.prototype.createDeleteFieldLink = function() {
    var that = this;
    var $deleteLink = $('<a href="#" class="btn btn-danger delete_field_link">Delete field</a>');

    $deleteLink.on('click', function(e) {
        e.preventDefault();
        $(this).closest('fieldset').remove();
        that.updateFieldsetPosition();
    });

    return $deleteLink;
}

FormFieldManager.prototype.createPrototypeForm = function() {
    var prototype = this.$container.attr('data-prototype');

    return $(prototype.replace(/__name__/g, this.$container.children().length-1));
}

FormFieldManager.prototype.addField = function($addLink) {
    $newForm = this.createPrototypeForm();
    $newForm.append(this.createDeleteFieldLink());
    $addLink.before($newForm);
}
