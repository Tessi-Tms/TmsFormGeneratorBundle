
// FormField

function FormFieldConstraint($field, ajaxUrl, ajaxLoaderPath) {
    this.$field = $field;
    this.ajaxUrl = ajaxUrl;
    this.ajaxLoaderPath = ajaxLoaderPath;
    this.$constraint = this.$field.find('.form_field_constraint_choice');
    this.$options = this.$field.find('.tms_form_generator_form_field_constraint_options');
    this.id = this.$options.attr('id');
    this.init();
}

FormFieldConstraint.prototype.init = function() {

    if (this.$constraint.length  == 0) {
        return false;
    }

    this.loadData(this.$constraint.val());

    var that = this;
    this.$constraint.on('change', function(event) {
        event.preventDefault();
        that.loadData($(this).val());
    });
}

FormFieldConstraint.prototype.loadData = function(constraint) {
    var $container = this.$options.siblings('.tms_form_generator_form_field_constraint_container');
    if ($container.length) {
        $container.empty();
    } else {
        $container = $('<div class="tms_form_generator_form_field_constraint_container"></div>');
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
        data: { name: this.id, constraint: constraint, data: btoa(unescape(encodeURIComponent(data))) },
        dataType: "html"
    });

    request.done(function(form) {
        var fields = $(form).html();
        var regExp = new RegExp('name="'+id, 'g')
        fields = fields.replace(regExp, 'name="'+name);
        $container.append(fields);
        $ajaxLoader.remove();
    });

    request.fail(function(jqXHR, textStatus) {
        alert("Request failed: " + textStatus);
    });
}


// FormFieldConstraintManager

function FormFieldConstraintManager($container) {
    this.$container = $container;

    this.$container.append(this.createAddConstraintLink());
    var that = this;
    this.$container.find('> fieldset').each(function() {
        $(this).append(that.createDeleteConstraintLink());
    });
}

FormFieldConstraintManager.prototype.updateFieldsetPosition = function() {
    var $container = this.$container
    containerId = $container.attr('id');
    regExp = new RegExp('[^_]*$', 'g');
    matches = regExp.exec(containerId);
    var constraintFieldName = matches[0];
    var constraintName = containerId.replace('_'+constraintFieldName, '');
    var checkedToKeep = {};

    $container.find('> fieldset').each(function(position) {
        var nameRegExp = new RegExp('(\\[constraints\\]\\[)([0-9]*)');
        var idRegExp = new RegExp('('+constraintName+'_'+constraintFieldName+'_)([0-9]*)');
        console.log(nameRegExp, idRegExp);
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

FormFieldConstraintManager.prototype.createAddConstraintLink = function() {
    var $addLink = $('<a href="#" class="btn btn-primary add_constraint_link">Add constraint</a>');

    var that = this;
    $addLink.on('click', function(e) {
        e.preventDefault();
        that.updateFieldsetPosition();
        that.addConstraint($(this));
    });

    return $addLink;
}

FormFieldConstraintManager.prototype.createDeleteConstraintLink = function() {
    var that = this;
    var $deleteLink = $('<a href="#" class="btn btn-danger delete_constraint_link">Delete constraint</a>');

    $deleteLink.on('click', function(e) {
        e.preventDefault();
        $(this).closest('fieldset').remove();
        that.updateFieldsetPosition();
    });

    return $deleteLink;
}

FormFieldConstraintManager.prototype.createPrototypeForm = function() {
    var prototype = this.$container.attr('data-prototype');

    return $(prototype.replace(/__name__/g, this.$container.children().length-1));
}

FormFieldConstraintManager.prototype.addConstraint = function($addLink) {
    $newForm = this.createPrototypeForm();
    $newForm.append(this.createDeleteConstraintLink());
    $addLink.before($newForm);
}
