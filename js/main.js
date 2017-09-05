/*
 * 2017 Sizing Servers Lab
 * University College of West-Flanders, Department GKG
 * 
 */
var endpoint = "http://localhost:5000";
var apiKey = "<insert a SHA-512 of a piece of text here>";
var systemInformations = [];
var newSystemInformationsCount = 0;
var collapsed = true;
//Templating without a template engine.
var template = "<div class=\"si\" id=\"si{{}}\"><div class=\"siHeader\"><button class=\"btn\" id=\"siToggleCollapse{{}}\">></button>&nbsp;<label id=\"siHostname{{}}\"></label>&nbsp;<span id=\"siIPs{{}}\"></span><span id=\"siTimestamp{{}}\"></span></div><div class=\"siBody\" id=\"siBody{{}}\"><ul><li id=\"siOS{{}}\"></li><li id=\"siSystem{{}}\"> </li><li id=\"siBaseboard{{}}\"> </li><li id=\"siBios{{}}\"> </li><li id=\"siProcessors{{}}\"> </li><li id=\"siMemoryModules{{}}\"></li><li id=\"siDisks{{}}\"> </li><li id=\"siNics{{}}\"> </li></ul><button class=\"btn btn-default\" id=\"remove{{}}\"><img src=\"img/remove.png\" /></button></div></div>";

var systemInformation = function (siJson) {
    var _me = this;
    var _hostname;

    //Templating without a template engine.
    ++newSystemInformationsCount;

    var _si = "#si" + newSystemInformationsCount;
    var _siToggleCollapse = "#siToggleCollapse" + newSystemInformationsCount;
    var _siHostname = "#siHostname" + newSystemInformationsCount;
    var _siIPs = "#siIPs" + newSystemInformationsCount;
    var _siTimestamp = "#siTimestamp" + newSystemInformationsCount;
    var _siBody = "#siBody" + newSystemInformationsCount;
    var _siOS = "#siOS" + newSystemInformationsCount;
    var _siSystem = "#siSystem" + newSystemInformationsCount;
    var _siBaseboard = "#siBaseboard" + newSystemInformationsCount;
    var _siBios = "#siBios" + newSystemInformationsCount;
    var _siProcessors = "#siProcessors" + newSystemInformationsCount;
    var _siMemoryModules = "#siMemoryModules" + newSystemInformationsCount;
    var _siDisks = "#siDisks" + newSystemInformationsCount;
    var _siNics = "#siNics" + newSystemInformationsCount;

    var _btnRemove = '#remove' + newSystemInformationsCount;


    $('#container').append(template.replace(/{{}}/g, newSystemInformationsCount));

    this.updateInfo = function (siJson) {
        _hostname = siJson['hostname'];
        $(_siHostname).text(_hostname);
        $(_siIPs).text(siJson['ips'].replace(/\t/g, ', '));

        var ts = siJson['timeStampInSecondsSinceEpochUtc'];
        if (ts < 10000000000) {
            ts *= 1000 //seconds to ms.
        }

        ts = new Date(ts + (new Date().getTimezoneOffset() * -1)); //Utc to timezone.
        $(_siTimestamp).text('(last updated: ' + ts + ')');


        $(_siOS).text('OS: ' + siJson['os']);
        $(_siSystem).text('System: ' + siJson['system']);
        $(_siBaseboard).text('Baseboard: ' + siJson['baseboard']);
        $(_siBios).text('BIOS: ' + siJson['bios']);
        $(_siProcessors).text('Processors: ' + siJson['processors'].replace(/\t/g, ', '));
        $(_siMemoryModules).text('Memory modules: ' + siJson['memoryModules'].replace(/\t/g, ','));
        $(_siDisks).text('Disks: ' + siJson['disks'].replace(/\t/g, ', '));
        $(_siNics).text('NICs: ' + siJson['nics'].replace(/\t/g, ', '));
    };

    this.hostname = function () {
        return _hostname;
    };

    this.collapsed = function () {
        return !$(_siBody).is(':visible');
    };
    this.collapse = function () {
        $(_siBody).hide();
        $(_siToggleCollapse).text('>');
    };
    this.uncollapse = function () {
        $(_siBody).show();
        $(_siToggleCollapse).text('V');
    }

    $(_siToggleCollapse).click(function () {
        if ($(_siBody).is(':visible')) {
            _me.collapse();
        }
        else {
            _me.uncollapse();
        }
    });

    $(_btnRemove).click(function () {
        systemInformations = jQuery.grep(systemInformations, function (value) {
            return value != _me;
        });
        $(_si).remove();

        $.ajax({
            url: endpoint + "/api/remove?apiKey=" + apiKey + "&hostname=" + _hostname,
            type: 'DELETE'
        });

    });

    this.collapse();
    this.updateInfo(siJson);
};

var refresh = function () {
    //Add or update the info on the GUI.
    $.getJSON(endpoint + "/api/list?apiKey=" + apiKey, function (data) {
        $.each(data, function (i, siJson) {
            addOrUpdateSystemInformation(siJson);
        });
    }).always(function () {
        sortSystemInformationByHostname();
    });
};

var addOrUpdateSystemInformation = function (siJson) {
    var si = null;
    $.each(systemInformations, function (i, siCandidate) {
        if (siCandidate.hostname() == siJson['hostname']) {
            si = siCandidate;
            si.updateInfo(siJson);
            return false;
        }
    });

    if (si == null) {
        systemInformations.push(new systemInformation(siJson));
    }
};

var sortSystemInformationByHostname = function () {
    var $sis = $('#container').children();
    $sis.sort(function (siX, siY) {
        var siXCounter = siX.getAttribute('id').substring('si'.length);
        var siYCounter = siY.getAttribute('id').substring('si'.length);

        var siXHostname = $('#siHostname' + siXCounter).text();
        var siYHostname = $('#siHostname' + siYCounter).text();

        if (siXHostname > siYHostname) {
            return 1;
        }
        if (siXHostname < siYHostname) {
            return -1;
        }
        return 0;
    });

    $sis.detach().appendTo($('#container'));
};

var collapse = function () {
    collapsed = !collapsed;

    var collapsedCount = 0;
    $.each(systemInformations, function (i, si) {
        if (si.collapsed()) {
            ++collapsedCount;
        }
    });

    if (collapsedCount == 0) {
        collapsed = true;
    } else if (collapsedCount == systemInformations.length) {
        collapsed = false;
    }

    $.each(systemInformations, function (i, si) {
        if (collapsed) {
            si.collapse();
        } else {
            si.uncollapse();
        }
    });
};

var main = function () {
    $('#collapse').click(function () { collapse(); });

    setTimeout(function () { refresh(); }, 1000);
    setInterval(function () { refresh(); }, 30000);
};


$(document).ready(main);