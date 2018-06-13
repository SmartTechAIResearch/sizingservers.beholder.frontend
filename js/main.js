/*
 * 2017 Sizing Servers Lab
 * University College of West-Flanders, Department GKG
 * 
 */
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
    var _ipOrHostname;
    var _guests = [];

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

    var _vhGuestContainer = '#vhGuestContainer' + newSystemInformationsCount;

    $('#container').append(templateVHost.replace(/{{}}/g, newSystemInformationsCount));

    this.updateInfo = function (siVHJson) {
        _ipOrHostname = siVHJson['ipOrHostname'];
        _guests = siVHJson['guestHostnames'].split('\t');

        $(_siVHIpOrHostname).text('VHOST ' + _ipOrHostname);

        var ts = siVHJson['timeStampInSecondsSinceEpochUtc'];
        if (ts < 10000000000) {
            ts *= 1000 //seconds to ms.
        }

        ts = new Date(ts + (new Date().getTimezoneOffset() * -1)); //Utc to timezone.
        $(_siVHTimestamp).text('(last updated: ' + ts + ')');


        $(_siVHOS).html('OS:&emsp;&emsp;&emsp;&emsp;&nbsp;' + siVHJson['os']);
        $(_siVHSystem).html('System:&emsp;&emsp;&nbsp;&nbsp;' + siVHJson['system']);
        $(_siVHBios).html('BIOS:&emsp;&emsp;&emsp;&nbsp;&nbsp;' + siVHJson['bios']);
        $(_siVHProcessors).html('Processors:&emsp;' + siVHJson['processors'].replace(/\t/g, ', ') + ' (total ' + siVHJson['numCpuCores'] + ' cores, ' + siVHJson['numCpuThreads'] + ' threads)');
        $(_siVHMemoryInGB).html('Memory:&emsp;&emsp;&nbsp;' + siVHJson['memoryInGB'] + ' GB');
        $(_siVHDatastores).html('Datastores:&emsp;&nbsp;' + siVHJson['datastores'].replace(/\t/g, ', '));
        $(_siVHDiskPaths).html('Paths:&emsp;&emsp;&emsp;&nbsp;&nbsp;' + siVHJson['vDiskPaths'].replace(/\t/g, ', '));
        $(_siVHNics).html('NICs:&emsp;&emsp;&emsp;&emsp;' + siVHJson['nics'].replace(/\t/g, ', '));
    };

    this.ipOrHostname = function () {
        return _ipOrHostname;
    };
    this.guests = function () {
        return _guests;
    };
    this.vhGuestContainer = function () {
        return _vhGuestContainer;
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
        if (confirm('Are you sure that you want to remove this?')) {
            $('body').addClass('preloader-site');
            $('.preloader-wrapper').fadeIn();

            vhSystemInformations = jQuery.grep(vhSystemInformations, function (value) {
                return value != _me;
            });
            $(_siVH).remove();

            $.ajax({
                url: endpointVH + "/remove?apiKey=" + apiKey + "&ipOrHostname=" + _ipOrHostname,
                type: 'DELETE'
            });

            setTimeout(function () { refresh(); }, 1000);
        }
    });

    $(_btnVHEdit).click(function () {
        $('#addEditVHost').show();
        $('#vhIpOrHostname').val(_ipOrHostname);
        $('#vhUsername').val('');
        $('#vhPassword').val('');
        $('#vhGuests').val(_guests.join(', '));
    });

    this.collapse();
    this.updateInfo(siVHJson);
};

var systemInformation = function (siJson, containerId) {
    var _me = this;
    var _hostname;
    var _containerId = containerId;
    var _instance;

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


    _instance = templateVM.replace(/{{}}/g, newSystemInformationsCount);
    $(containerId).append(_instance);

    this.updateInfo = function (siJson, containerId) {

        if (_containerId != containerId) {
            $(_si).detach();
            $(containerId).append(_instance);
            _containerId = containerId;
        }

        _hostname = siJson['hostname'];
        $(_siHostname).text(_hostname);
        $(_siIPs).text(siJson['ips'].replace(/\t/g, ', '));

        var ts = siJson['timeStampInSecondsSinceEpochUtc'];
        if (ts < 10000000000) {
            ts *= 1000 //seconds to ms.
        }

        ts = new Date(ts + (new Date().getTimezoneOffset() * -1)); //Utc to timezone.
        $(_siTimestamp).text('(last updated: ' + ts + ')');


        $(_siOS).html('OS:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;' + siJson['os']);
        $(_siSystem).html('System:&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;' + siJson['system']);
        $(_siBaseboard).html('Baseboard:&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;' + siJson['baseboard']);
        $(_siBios).html('BIOS:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;' + siJson['bios']);
        $(_siProcessors).html('Processors:&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + siJson['processors'].replace(/\t/g, ', '));
        $(_siMemoryModules).html('Memory modules:&emsp;' + siJson['memoryModules'].replace(/\t/g, ','));
        $(_siDisks).html('Disks:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;' + siJson['disks'].replace(/\t/g, ', '));
        $(_siNics).html('NICs:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;' + siJson['nics'].replace(/\t/g, ', '));
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
        if (confirm('Are you sure that you want to remove this?')) {
            systemInformations = jQuery.grep(systemInformations, function (value) {
                return value != _me;
            });
            $(_si).remove();

            $.ajax({
                url: endpoint + "/remove?apiKey=" + apiKey + "&hostname=" + _hostname,
                type: 'DELETE'
            });
        }
    });

    this.collapse();
    this.updateInfo(siJson, containerId);
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
                var hostname = siJson['hostname'];
                var containerId = '#container';
                $.each(vhSystemInformations, function (j, vhSI) {
                    if ($.inArray(hostname, vhSI.guests()) != -1) {
                        containerId = vhSI.vhGuestContainer();
                        return false; //break
                    }
                });
                addOrUpdateSystemInformation(siJson, containerId);
            });
        }).always(function () {
            sortSystemInformationByHostname();
            $('.preloader-wrapper').fadeOut();
            $('body').removeClass('preloader-site');
        })
    });
};

var addOrUpdateSystemInformation = function (siJson, containerId) {
    var si = null;
    $.each(systemInformations, function (i, siCandidate) {
        if (siCandidate.hostname() == siJson['hostname']) {
            si = siCandidate;
            si.updateInfo(siJson, containerId);
            return false;
        }
    });

    if (si == null) {
        systemInformations.push(new systemInformation(siJson, containerId));
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
    if (!vmwareHostConnectionInfo['username'].length) {
        vmwareHostConnectionInfo['username'] = ".&DO_NOT_UPDATE_Credentials&.";
        vmwareHostConnectionInfo['password'] = "";
    }
    if (vmwareHostConnectionInfo['ipOrHostname'].length) {
        if (!vmwareHostConnectionInfo['password'].length || 
        (vmwareHostConnectionInfo['password'].length && confirm('Caution! Credentials will be send over the network. Are you sure that you want to do this?'))) {
            $('body').addClass('preloader-site');
            $('.preloader-wrapper').fadeIn();

            $.ajax({
                url: endpointVH + "/addorupdate?apiKey=" + apiKey,
                data: JSON.stringify(vmwareHostConnectionInfo),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: 'POST'
            }).success(function () {
                refresh();
            });
        }
    } else {
        alert('All fields are mandatory, except for guests.');
    }
};

var collapse = function () {
    collapsed = !collapsed;

    var collapsedCount = 0;
    $.each(systemInformations, function (i, si) {
        if (si.collapsed()) {
            ++collapsedCount;
        }
    });
    $.each(vhSystemInformations, function (i, si) {
        if (si.collapsed()) {
            ++collapsedCount;
        }
    });

    if (collapsedCount == 0) {
        collapsed = true;
    } else if (collapsedCount == systemInformations.length + vhSystemInformations.length) {
        collapsed = false;
    }

    $.each(systemInformations, function (i, si) {
        if (collapsed) {
            si.collapse();
        } else {
            si.uncollapse();
        }
    });
    $.each(vhSystemInformations, function (i, si) {
        if (collapsed) {
            si.collapse();
        } else {
            si.uncollapse();
        }
    });
};

var main = function () {
    $('body').addClass('preloader-site');
    $('.preloader-wrapper').fadeIn();

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