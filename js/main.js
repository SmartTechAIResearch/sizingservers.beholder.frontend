/*
 * 2017 Sizing Servers Lab
 * University College of West-Flanders, Department GKG
 * 
 */
//var endpoint = "http://localhost:5000/systeminformations"; //New dotnet framework api (includes VMware vHost hw monitoring)
//var endpointVMH = "http://localhost:5000/vmwarehosts"
//var endpoint = "http://localhost:5000/api"; // dotnetcore api
var endpoint = "http://localhost:28751/systeminformations"; //New dotnet framework api (includes VMware vHost hw monitoring)
var endpointVH = "http://localhost:28751/vmwarehosts"
var apiKey = "<insert a SHA-512 of a piece of text here>";
var systemInformations = [];
var vhSystemInformations = [];
var newSystemInformationsCount = 0;
var collapsed = true;
//Templating without a template engine.
var templateVHost = "<div class=\"si\" id=\"siVH{{}}\"><div class=\"siVHHeader\"><button class=\"btn\" id=\"siVHToggleCollapse{{}}\">></button>&nbsp;<label id=\"siVHIpOrHostname{{}}\"></label>&nbsp;<span id=\"siVHTimestamp{{}}\"></span></div><div class=\"siBody\" id=\"siVHBody{{}}\"><ul><li id=\"siVHOS{{}}\"></li><li id=\"siVHSystem{{}}\"> </li><li id=\"siVHBios{{}}\"> </li><li id=\"siVHProcessors{{}}\"> </li><li id=\"siVHMemoryInGB{{}}\"></li><li id=\"siVHDatastores{{}}\"></li><li id=\"siVHDiskPaths{{}}\"> </li><li id=\"siVHNics{{}}\"> </li></ul><button class=\"btn btn-default\" id=\"vhEdit{{}}\">...</button>&nbsp;<button class=\"btn btn-default\" id=\"vhRemove{{}}\"><img src=\"img/remove.png\" /></button></div><div class=\"vhGuestContainer\" id=\"vhGuestContainer{{}}\"></div></div>";
var templateVM = "<div class=\"si\" id=\"si{{}}\"><div class=\"siHeader\"><button class=\"btn\" id=\"siToggleCollapse{{}}\">></button>&nbsp;<label id=\"siHostname{{}}\"></label>&nbsp;<span id=\"siIPs{{}}\"></span><span id=\"siTimestamp{{}}\"></span></div><div class=\"siBody\" id=\"siBody{{}}\"><ul><li id=\"siOS{{}}\"></li><li id=\"siSystem{{}}\"> </li><li id=\"siBaseboard{{}}\"> </li><li id=\"siBios{{}}\"> </li><li id=\"siProcessors{{}}\"> </li><li id=\"siMemoryModules{{}}\"></li><li id=\"siDisks{{}}\"> </li><li id=\"siNics{{}}\"> </li></ul><button class=\"btn btn-default\" id=\"remove{{}}\"><img src=\"img/remove.png\" /></button></div></div>";

var vhSystemInformation = function (siVHJson) {
    var _me = this;
    var _ipOrHostname, _guests;

    //Templating without a template engine.
    ++newSystemInformationsCount;

    var _siVH = "#siVH" + newSystemInformationsCount;
    var _siVHToggleCollapse = "#siVHToggleCollapse" + newSystemInformationsCount;
    var _siVHIpOrHostname = "#siVHIpOrHostname" + newSystemInformationsCount;
    var _siVHTimestamp = "#siVHTimestamp" + newSystemInformationsCount;
    var _siVHBody = "#siVHBody" + newSystemInformationsCount;
    var _siVHOS = "#siVHOS" + newSystemInformationsCount;
    var _siVHSystem = "#siVHSystem" + newSystemInformationsCount;
    var _siVHBios = "#siVHBios" + newSystemInformationsCount;
    var _siVHProcessors = "#siVHProcessors" + newSystemInformationsCount;
    var _siVHMemoryInGB = "#siVHMemoryInGB" + newSystemInformationsCount;
    var _siVHDatastores = "#siVHDatastores" + newSystemInformationsCount;
    var _siVHDiskPaths = "#siVHDiskPaths" + newSystemInformationsCount;
    var _siVHNics = "#siVHNics" + newSystemInformationsCount;

    var _btnVHEdit = '#vhEdit' + newSystemInformationsCount;
    var _btnVHRemove = '#vhRemove' + newSystemInformationsCount;

    var vhGuestContainer = '#vhGuestContainer' + newSystemInformationsCount;


    $('#container').append(templateVHost.replace(/{{}}/g, newSystemInformationsCount));

    this.updateInfo = function (siVHJson) {
        _ipOrHostname = siVHJson['ipOrHostname'];
        _guests = siVHJson['guestHostnames'].replace(/\t/g, ', ');

        $(_siVHIpOrHostname).text('VHOST ' + _ipOrHostname);

        var ts = siVHJson['timeStampInSecondsSinceEpochUtc'];
        if (ts < 10000000000) {
            ts *= 1000 //seconds to ms.
        }

        ts = new Date(ts + (new Date().getTimezoneOffset() * -1)); //Utc to timezone.
        $(_siVHTimestamp).text('(last updated: ' + ts + ')');


        $(_siVHOS).text('OS: ' + siVHJson['os']);
        $(_siVHSystem).text('System: ' + siVHJson['system']);
        $(_siVHBios).text('BIOS: ' + siVHJson['bios']);
        $(_siVHProcessors).text('Processors: ' + siVHJson['processors'].replace(/\t/g, ', ') + ' (Total ' + siVHJson['numCpuCores'] + ' cores, ' + siVHJson['numCpuThreads'] + ' threads)');
        $(_siVHMemoryInGB).text('Memory: ' + siVHJson['memoryInGB'] + ' GB');
        $(_siVHDatastores).text('Datastores: ' + siVHJson['datastores'].replace(/\t/g, ', '));
        $(_siVHDiskPaths).text('Paths: ' + siVHJson['vDiskPaths'].replace(/\t/g, ', '));
        $(_siVHNics).text('NICs: ' + siVHJson['nics'].replace(/\t/g, ', '));
    };

    this.ipOrHostname = function () {
        return _ipOrHostname;
    };

    this.collapsed = function () {
        return !$(_siVHBody).is(':visible');
    };
    this.collapse = function () {
        $(_siVHBody).hide();
        $(_siVHToggleCollapse).text('>');
    };
    this.uncollapse = function () {
        $(_siVHBody).show();
        $(_siVHToggleCollapse).text('V');
    }

    $(_siVHToggleCollapse).click(function () {
        if ($(_siVHBody).is(':visible')) {
            _me.collapse();
        }
        else {
            _me.uncollapse();
        }
    });

    $(_btnVHRemove).click(function () {
        vhSystemInformations = jQuery.grep(vhSystemInformations, function (value) {
            return value != _me;
        });
        $(_siVH).remove();

        $.ajax({
            url: endpointVH + "/remove?apiKey=" + apiKey + "&ipOrHostname=" + _ipOrHostname,
            type: 'DELETE'
        });

    });

    $(_btnVHEdit).click(function () {
        $('#addEditVHost').show();
        $('#vhIpOrHostname').val(_ipOrHostname);
        $('#vhUsername').val('');
        $('#vhPassword').val('');
        $('#vhGuests').val(_guests);
    });

    this.collapse();
    this.updateInfo(siVHJson);
};

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


    $('#container').append(templateVM.replace(/{{}}/g, newSystemInformationsCount));

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
            url: endpoint + "/remove?apiKey=" + apiKey + "&hostname=" + _hostname,
            type: 'DELETE'
        });

    });

    this.collapse();
    this.updateInfo(siJson);
};

var refresh = function () {
    //Add or update the info on the GUI.
    $.getJSON(endpointVH + "/listsysteminformation?apiKey=" + apiKey, function (data) {
        $.each(data, function (i, siVHJson) {
            addOrUpdateVHSystemInformation(siVHJson);
        });
    }).always(function () {
        $.getJSON(endpoint + "/list?apiKey=" + apiKey, function (data) {
            $.each(data, function (i, siJson) {
                addOrUpdateSystemInformation(siJson);
            });
        }).always(function () {
            sortSystemInformationByHostname();
        })
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

var addOrUpdateVHSystemInformation = function (siVHJson) {
    var si = null;
    $.each(vhSystemInformations, function (i, siCandidate) {
        if (siCandidate.ipOrHostname() == siVHJson['ipOrHostname']) {
            si = siCandidate;
            si.updateInfo(siVHJson);
            return false;
        }
    });

    if (si == null) {
        vhSystemInformations.push(new vhSystemInformation(siVHJson));
    }
};

//Does not work yet
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

var addEditVHost = function () {
    var vmwareHostConnectionInfo = {
        'ipOrHostname': $.trim($('#vhIpOrHostname').val()),
        'guestHostnames': $.trim($('#vhGuests').val()).replace(/' '/g, '').replace(/'\t'/g, '').replace(/','/g, '\t'),
        'username': $.trim($('#vhUsername').val()),
        'password': $('#vhPassword').val()
    };

    $.ajax({
        url: endpointVH + "/addorupdate?apiKey=" + apiKey,
        data: JSON.stringify(vmwareHostConnectionInfo),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: 'POST'
    }).success(function () {
        alert('success');
    });
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
    $('#addvhost').click(function () { $('#addEditVHost').show(); });
    $('#collapse').click(function () { collapse(); });

    $('#vhApply').click(function () { addEditVHost(); });
    $('#vhCancel').click(function () {
        $('#addEditVHost').hide();
        $('#vhUsername').val('');
        $('#vhPassword').val('');
    });

    setTimeout(function () { refresh(); }, 1000);
    setInterval(function () { refresh(); }, 30000);
};


$(document).ready(main);