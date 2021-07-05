'use strict';

import BpmnJS from "bpmn-js/lib/Modeler";

import camundaModdlePackage from "camunda-bpmn-moddle/resources/camunda";
import camundaModdleExtension from "camunda-bpmn-moddle/lib";

import zeebeModdlePackage from "zeebe-bpmn-moddle/resources/zeebe";
import zeebeModdleExtension from "zeebe-bpmn-moddle/lib";

var removeDiacritics = require('diacritics').remove;
var domify = require('min-dom/lib/domify'),
    domEvent = require('min-dom/lib/event'),
    domClasses = require('min-dom/lib/classes'),
    domQuery = require('min-dom/lib/query'),
    clear = require('min-dom/lib/clear');
//    BpmnJS = require('bpmn-js/lib/Modeler');

const bpmnJS = new BpmnJS({
  additionalModules: [camundaModdleExtension, zeebeModdleExtension],
  moddleExtensions: {
    camunda: camundaModdlePackage,
    zeebe: zeebeModdlePackage
  }
  });
const moddle = bpmnJS.get('moddle');

export default function ConvertToCamundaCloudPlugin(elementRegistry, editorActions, canvas, modeling) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._modeling = modeling;

  this.state = {
    open: false
  };

  editorActions.register({
    convertToCamundaCloud: function() {
      self.convertToCamundaCloud();
    }
  });
}

// https://github.com/camunda-community-hub/camunda-modeler-plugin-rename-technical-ids/blob/main/client/RenameTechnicalIDsPlugin.js
// https://github.com/bpmn-io/bpmn-js-examples/tree/master/bpmn-properties
// https://github.com/camunda/camunda-modeler-plugin-example
// https://github.com/camunda/camunda-modeler/tree/master/docs/plugins
// https://www.youtube.com/watch?v=sav98y4EFzE
ConvertToCamundaCloudPlugin.prototype.convertToCamundaCloud = function() {
  var self = this;

  var elements = this._elementRegistry._elements;  
  Object.keys(elements).forEach(function(key) {
    var element = elements[key].element;
    if (element.type == "bpmn:ServiceTask") {
      convertServiceTask(element);
      console.log(element);
    } else if (element.type == "bpmn:ServiceTask") {
    }

  });

  save();
};

/**
 * 
 *  {  if ( type === 'bpmn:Process' ) {
    return name + 'Process';
  } else if ( type === 'bpmn:IntermediateCatchEvent' || type === 'bpmn:IntermediateThrowEvent' ) {
    return name + 'Event';
  } else if ( type === 'bpmn:UserTask' || type === 'bpmn:ServiceTask' || type === 'bpmn:ReceiveTask' || type === 'bpmn:SendTask' 
                || type === 'bpmn:ManualTask' || type === 'bpmn:BusinessRuleTask' || type === 'bpmn:ScriptTask' ) {
    return name + 'Task';
  } else if ( type === 'bpmn:ExclusiveGateway' || type === 'bpmn:ParallelGateway' || type === 'bpmn:ComplexGateway' 
                || type === 'bpmn:EventBasedGateway' ) {
    return name + 'Gateway';
  } else {
    return name + type.replace('bpmn:','');
  }} element 
 */

function convertServiceTask(element) {
  if (element.businessObject.topic) { // External Tasks
    var taskDef = moddle.create("zeebe:TaskDefinition");
    taskDef.type = element.businessObject.topic;
    addExtensionElement(element, taskDef);
  }

}

function addExtensionElement(element, extensionElement) {
  if (!element.businessObject.extensionElements) {
    var moddleExtensionElements = moddle.create('bpmn:ExtensionElements', {});          
    moddleExtensionElements.get('values').push(extensionElement);
    element.businessObject.extensionElements = moddleExtensionElements;
  } else {
    //??
  }
}

function save() {
  // trigger a tab save operation
  this._triggerAction('save')
    .then(tab => {
      if (!tab) {
        return this._displayNotification({ title: 'Failed to save' });
      } else {
        console.log("saved");
    }
    });
}



ConvertToCamundaCloudPlugin.$inject = [ 'elementRegistry', 'editorActions', 'canvas', 'modeling'];