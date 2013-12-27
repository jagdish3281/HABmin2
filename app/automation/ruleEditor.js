/**
 * HABmin - the openHAB admin interface
 *
 * openHAB, the open Home Automation Bus.
 * Copyright (C) 2010-2013, openHAB.org <admin@openhab.org>
 *
 * See the contributors.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or
 * combining it with Eclipse (or a modified version of that library),
 * containing parts covered by the terms of the Eclipse Public License
 * (EPL), the licensors of this Program grant you additional permission
 * to convey the resulting work.
 */

/**
 * OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */

Ext.define('openHAB.automation.ruleEditor', {
    extend: 'Ext.panel.Panel',
    layout: 'fit',
//    icon: 'images/application-list.png',
//    title: 'Rules Editor',

    initComponent: function () {
        var fontSize = 10;
        var modelName;
        var ruleName;

        modelName = this.modelName;
        ruleName = this.ruleName;

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/cross.png',
                    itemId: 'cancel',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Cancel changes made to the rule file',
                    handler: function () {
                        loadModel(modelName, ruleName);
                    }
                },
                {
                    icon: 'images/disk.png',
                    itemId: 'save',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Save changes to the rule file',
                    handler: function () {
                        // Create the RuleModelBean
                        var bean = {};
                        bean.model = modelName;
                        bean.source = editor.getValue();

                        Ext.Ajax.request({
                            url: HABminBaseURL + "/config/rules/model/source/" + modelName,
                            headers: {'Accept': 'application/json'},
                            method: 'PUT',
                            jsonData: bean,
                            success: function (response, opts) {
                                var json = Ext.decode(response.responseText);
                                if (json == null) {
                                    handleStatusNotification(NOTIFICATION_ERROR, 'Error saving rule model "' + modelName + '"');
                                    return;
                                }

                                // Update the toolbar
                                toolbar.getComponent('save').disable();
                                toolbar.getComponent('cancel').disable();

                                handleStatusNotification(NOTIFICATION_OK, 'Rule model "' + modelName + '" saved successfully.');
                            },
                            failure: function (result, request) {
                                handleStatusNotification(NOTIFICATION_ERROR, 'Error saving rule model "' + modelName + '"');
                            }
                        });

                        editor.setFocus();
                    }
                },
                {
                    icon: 'images/arrow-circle-225-left.png',
                    itemId: 'undo',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Undo changes',
                    handler: function () {
                        editor.undo();
                        editor.setFocus();
                    }
                },
                {
                    icon: 'images/arrow-circle-315.png',
                    itemId: 'redo',
                    cls: 'x-btn-icon',
                    disabled: true,
                    tooltip: 'Redo changes',
                    handler: function () {
                        editor.redo();
                        editor.setFocus();
                    }
                },
                {
                    icon: 'images/edit-size-up.png',
                    itemId: 'font-large',
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: 'Increase font size',
                    handler: function () {
                        if(fontSize > 32)
                            return;
                        fontSize = fontSize + 1;
                        editor.setFontSize(fontSize);
                        editor.setFocus();
                    }
                },
                {
                    icon: 'images/edit-size-down.png',
                    itemId: 'font-small',
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: 'Decrease font size',
                    handler: function () {
                        if(fontSize < 6)
                            return;
                        fontSize = fontSize - 1;
                        editor.setFontSize(fontSize);
                        editor.setFocus();
                    }
                },
                {
                    icon: 'images/edit-code.png',
                    itemId: 'insert',
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: 'Add openHAB rule template at cursor location',
                    handler: function () {
                        editor.insertText('rule "<name here>"\nwhen\n\nthen\n\nend\n');
                        editor.setFocus();
                    }
                },
                {
                    icon: 'images/document-node.png',
                    itemId: 'itemlist',
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: 'Add openHAB item name at cursor location',
                    handler: function () {
                        var form = Ext.widget('form', {
                            layout:{
                                type:'vbox',
                                align:'stretch'
                            },
                            border:false,
                            bodyPadding:10,
                            fieldDefaults:{
                                labelAlign:'top',
                                labelWidth:100,
                                labelStyle:'font-weight:bold'
                            },
                            defaults:{
                                margins:'0 0 10 0'
                            },
                            items:[
                                {
                                    margin:'0 0 0 0',
                                    xtype:'combobox',
                                    fieldLabel:'Item name:',
                                    itemId:'name',
                                    name:'name',
                                    store:itemConfigStore,
                                    allowBlank:false,
                                    valueField:'name',
                                    displayField:'name',
                                    queryMode:'local',
                                    forceSelection:false,
                                    editable:true,
                                    typeAhead:true
                                }
                            ],
                            buttons:[
                                {
                                    text:'Cancel',
                                    handler:function () {
                                        this.up('window').destroy();
                                    }
                                },
                                {
                                    text:'Insert Item',
                                    handler:function () {
                                        if (this.up('form').getForm().isValid()) {
                                            // Read the item name
                                            editor.insertText(form.getForm().findField('name').getSubmitValue());
                                            editor.setFocus();

                                            this.up('window').destroy();
                                        }
                                    }
                                }
                            ]
                        });

                        var saveWin = Ext.widget('window', {
                            title:'Select Item Name',
                            closeAction:'destroy',
                            width:325,
                            resizable:false,
                            draggable:false,
                            modal:true,
                            layout:{
                                type:'vbox',
                                align:'stretch'
                            },
                            items:[form]
                        });

                        saveWin.show();
                        editor.setFocus();
                    }
                }
            ]
        });

        var editor = Ext.create('Ext.ux.aceeditor.Panel', {
            tbar: toolbar,
            theme: 'eclipse',
            parser: 'openhabrules',
            layout: 'fit',
            printMargin: true,
            fontSize: fontSize + 'px',
            editorId: 'aceRuleEditor',

            // Add listeners so that undo etc toolbar buttons can be set in context
            listeners: {
                change: function (editor) {
                    toolbar.getComponent('save').enable();
                    toolbar.getComponent('cancel').enable();
                    toolbar.getComponent('undo').enable();
                    toolbar.getComponent('redo').enable();
                }
            }
        });

        this.items = [editor];

        this.callParent();

        loadModel(this.modelName, this.ruleName);

        // Load the model from openHAB
        function loadModel(modelName, ruleName) {
            // Check if modelName is defined
            if (modelName == null) {
                handleStatusNotification(NOTIFICATION_ERROR, 'Error loading rule model - no model defined');
                return;
            }

            Ext.Ajax.request({
                url: HABminBaseURL + "/config/rules/model/source/" + modelName,
                headers: {'Accept': 'application/json'},
                method: 'GET',
                success: function (response, opts) {
                    var json = Ext.decode(response.responseText);
                    if (json == null) {
                        handleStatusNotification(NOTIFICATION_ERROR, 'Error loading rule model "' + modelName + '"');
                        return;
                    }

                    // Set the editor text
                    editor.setValue(json.source);
                    editor.setFocus();

                    // Disable the toolbar
                    toolbar.getComponent('save').disable();
                    toolbar.getComponent('cancel').disable();
                    toolbar.getComponent('undo').disable();
                    toolbar.getComponent('redo').disable();

                    // TODO: Find the named rule - if set

                    // Notify the user we're done
                    if(json.source == null || json.source.length == 0)
                        handleStatusNotification(NOTIFICATION_OK, 'Rule model "' + modelName + '" created successfully.');
                    else
                        handleStatusNotification(NOTIFICATION_OK, 'Rule model "' + modelName + '" loaded successfully.');
                },
                failure: function (result, request) {
                    handleStatusNotification(NOTIFICATION_ERROR, 'Error loading rule model "' + modelName + '"');
                }
            });
        }
    }
})
;