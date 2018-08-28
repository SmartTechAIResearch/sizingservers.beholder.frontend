/*
 * 2017 Sizing Servers Lab
 * University College of West-Flanders, Department GKG
 * 
 */
var endpoint = "http://localhost:28751";
var apiKey = "<insert a SHA-512 of a piece of text here>";
var systemInformations = [];
var vhSystemInformations = [];
var newSystemInformationsCount = 0;
var collapsed = true;
//To make sure that comments are updated server-side
var commentsFocus = false;
//Templating without a template engine.
var templateVHost =
    "<div class=\"si\" id=\"siVH{{}}\">\
  <div class=\"siVHHeader\">\
    <img class=\"flatbtn\" id=\"siVHToggleCollapse{{}}\" src=\"img/angle-right.svg\"></img>\
    <img class=\"icon\" src=\"img/VMwareHost.svg\"></img>\
    <label id=\"siVHHostname{{}}\"></label>\
    <span id=\"siVHIPs{{}}\"></span>\
    <span id=\"siVHTimestamp{{}}\"></span>\
  </div>\
  <div class=\"siBody\" id=\"siVHBody{{}}\">\
    <ul>\
      <li id=\"siVHOS{{}}\"></li>\
      <li id=\"siVHSystem{{}}\"></li>\
      <li id=\"siVHBios{{}}\"></li>\
      <li id=\"siVHBmcIp{{}}\"></li>\
      <li id=\"siVHProcessors{{}}\"></li>\
      <li id=\"siVHMemoryInGB{{}}\"></li>\
      <li id=\"siVHDatastores{{}}\"></li>\
      <li id=\"siVHDiskPaths{{}}\"></li>\
      <li id=\"siVHNics{{}}\"></li>\
    </ul>&emsp;&emsp;&emsp;\
    <div>\
      <textarea id=\"siVHComments{{}}\" placeholder=\"Comments\"></textarea>\
    </div>\
    <img class=\"flatbtn\" id=\"vhApply{{}}\" src=\"img/check-circle.svg\"></img>\
    <img class=\"flatbtn\" id=\"vhEdit{{}}\" src=\"img/ellipsis-h.svg\"></img>\
    <img class=\"flatbtn\" id=\"vhRemove{{}}\" src=\"img/trash-alt.svg\"></img>\
  </div>\
  <div class=\"vhVMContainer\" id=\"vhVMContainer{{}}\">\
  </div>\
 </div>";

var templateVM =
    "<div class=\"si\" id=\"si{{}}\">\
  <div class=\"siHeader\">\
    <img class=\"flatbtn\" id=\"siToggleCollapse{{}}\" src=\"img/angle-right.svg\"></img>\
    <img class=\"icon\" id=\"siIcon{{}}\" src=\"img/server.svg\"></img>\
    <label id=\"siHostname{{}}\"></label>\
    <span id=\"siIPs{{}}\"></span>\
    <span id=\"siTimestamp{{}}\"></span>\
  </div>\
  <div class=\"siBody\" id=\"siBody{{}}\">\
    <ul>\
      <li id=\"siOS{{}}\"></li>\
      <li id=\"siSystem{{}}\"></li>\
      <li id=\"siBaseboard{{}}\"></li>\
      <li id=\"siBios{{}}\"></li>\
      <li id=\"siBmcIp{{}}\"></li>\
      <li id=\"siProcessors{{}}\"></li>\
      <li id=\"siMemoryModules{{}}\"></li>\
      <li id=\"siDisks{{}}\"></li>\
      <li id=\"siNics{{}}\"></li>\
    </ul>&emsp;&emsp;&nbsp;\
    <div>\
      <textarea id=\"siComments{{}}\" placeholder=\"Comments\"></textarea>\
    </div>\
    <img class=\"flatbtn\" id=\"apply{{}}\" src=\"img/check-circle.svg\"></img>\
    <img class=\"flatbtn\" id=\"remove{{}}\" src=\"img/trash-alt.svg\"></img>\
  </div>\
</div>";

var vhSystemInformation = function (siVHJson) {
    var _me = this;
    var _hostname;
    var _vms = [];

    //Templating without a template engine.
    ++newSystemInformationsCount;

    var _siVH = "#siVH" + newSystemInformationsCount;
    var _siVHToggleCollapse = "#siVHToggleCollapse" + newSystemInformationsCount;
    var _siVHHostname = "#siVHHostname" + newSystemInformationsCount;
    var _siVHIPs = "#siVHIPs" + newSystemInformationsCount;
    var _siVHTimestamp = "#siVHTimestamp" + newSystemInformationsCount;
    var _siVHBody = "#siVHBody" + newSystemInformationsCount;
    var _siVHOS = "#siVHOS" + newSystemInformationsCount;
    var _siVHSystem = "#siVHSystem" + newSystemInformationsCount;
    var _siVHBios = "#siVHBios" + newSystemInformationsCount;
    var _siVHBmcIp = "#siVHBmcIp" + newSystemInformationsCount;
    var _siVHProcessors = "#siVHProcessors" + newSystemInformationsCount;
    var _siVHMemoryInGB = "#siVHMemoryInGB" + newSystemInformationsCount;
    var _siVHDatastores = "#siVHDatastores" + newSystemInformationsCount;
    var _siVHDiskPaths = "#siVHDiskPaths" + newSystemInformationsCount;
    var _siVHNics = "#siVHNics" + newSystemInformationsCount;
    var _siVHComments = "#siVHComments" + newSystemInformationsCount;

    var _btnVHApply = '#vhApply' + newSystemInformationsCount;
    var _btnVHEdit = '#vhEdit' + newSystemInformationsCount;
    var _btnVHRemove = '#vhRemove' + newSystemInformationsCount;

    var _vhVMContainer = '#vhVMContainer' + newSystemInformationsCount;

    $('#container').append(templateVHost.replace(/{{}}/g, newSystemInformationsCount));

    this.updateInfo = function (siVHJson) {
        try {
            _hostname = siVHJson['hostname'];
            $(_siVHHostname).text(_hostname);

            try {
                _vms = siVHJson['vmHostnames'].split('\t');
            } catch (ignoreEx) { }

            try {
                $(_siVHIPs).text(siVHJson['ips'].replace(/\t/g, ', '));
            } catch (ignoreEx) { }

            try {
                var ts = siVHJson['timeStampInSecondsSinceEpochUtc'];
                if (ts < 10000000000) {
                    ts *= 1000 //seconds to ms.
                }

                ts = new Date(ts + (new Date().getTimezoneOffset() * -1)); //Utc to timezone.
                $(_siVHTimestamp).text('(last updated: ' + ts.toLocaleString() + ')');
            } catch (ignoreEx) { }

            try {
                $(_siVHOS).html('OS:&emsp;&emsp;&emsp;&emsp;&nbsp;' + siVHJson['os']);
            } catch (ignoreEx) { }
            try {
                $(_siVHSystem).html('System:&emsp;&emsp;&nbsp;&nbsp;' + siVHJson['system']);
            } catch (ignoreEx) { }
            try {
                $(_siVHBios).html('BIOS:&emsp;&emsp;&emsp;&nbsp;&nbsp;' + siVHJson['bios']);
            } catch (ignoreEx) { }
            try {
                $(_siVHBmcIp).html('BMC IP:&emsp;&emsp;&nbsp;&nbsp;' + siVHJson['bmcIp']);
            } catch (ignoreEx) { }

            try {
                $(_siVHProcessors).html('Processors:<ul></ul>');
                $.each(siVHJson['processors'].split('\t'), function (index, value) {
                    $(_siVHProcessors + ' ul').append('<li>' + value + '</li>');
                });
                $(_siVHProcessors + ' ul').append('<li> (total ' + siVHJson['numCpuCores'] + ' cores, ' + siVHJson['numCpuThreads'] + ' threads)</li>');
            } catch (ignoreEx) { }

            try {
                $(_siVHMemoryInGB).html('Memory:&emsp;&emsp;&nbsp;' + siVHJson['memoryInGB'] + ' GB');
            } catch (ignoreEx) { }

            try {
                $(_siVHDatastores).html('Datastores:<ul></ul>');
                $.each(siVHJson['datastores'].split('\t'), function (index, value) {
                    $(_siVHDatastores + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                $(_siVHDiskPaths).html('Paths:<ul></ul>');
                $.each(siVHJson['vDiskPaths'].split('\t'), function (index, value) {
                    $(_siVHDiskPaths + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                $(_siVHNics).html('NICs:<ul></ul>');
                $.each(siVHJson['nics'].split('\t'), function (index, value) {
                    $(_siVHNics + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                if (!$(_siVHComments).is(':focus')) {
                    $(_siVHComments).val(siVHJson['comments']);
                }
            } catch (ignoreEx) { }

            if (!siVHJson['responsive']) {
                throw $(_siVHHostname).text() + ' > disabled because not responding';
            }
        } catch (ex) {
            $(_siVHHostname).text(ex);
            $(_siVHTimestamp).text('-- uncollapse, edit connection info (...), click \"Apply / re-enable\" wait for refresh (last fetch attempt: ' + (new Date()).toLocaleString() + ')');
            handleError("Failed updating system information (vhost reachable?). See the console for details.", ex);
        };
    };

    this.hostname = function () {
        return _hostname;
    };
    this.vms = function () {
        return _vms;
    };
    this.vhVMContainer = function () {
        return _vhVMContainer;
    };
    this.collapsed = function () {
        return !$(_siVHBody).is(':visible');
    };
    this.collapse = function () {
        $(_siVHBody).hide();
        $(_siVHToggleCollapse).attr('src', 'img/angle-right.svg');
    };
    this.uncollapse = function () {
        $(_siVHBody).show();
        $(_siVHToggleCollapse).attr('src', 'img/angle-down.svg');
    }

    $(_siVHToggleCollapse).click(function () {
        if ($(_siVHBody).is(':visible')) {
            _me.collapse();
        }
        else {
            _me.uncollapse();
        }
    });

    $(_siVHComments).focusin(function () {
        commentsFocus = true;
    });
    $(_siVHComments).focusout(function () {
        commentsFocus = false;
    });

    $(_btnVHApply).click(function () {
        var comments = JSON.stringify($(_siVHComments).val());
        $.ajax({
            url: endpoint + "/vmwarehosts/addorupdatecomments?apiKey=" + apiKey + "&hostname=" + _hostname,
            data: comments,
            type: 'PUT',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        });
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
                url: endpoint + "/vmwarehosts/remove?apiKey=" + apiKey + "&hostname=" + _hostname,
                type: 'DELETE'
            });

            setTimeout(function () { refresh(); }, 1000);
        }
    });

    $(_btnVHEdit).click(function () {
        $('#addEditVHost').show();
        setContainerTopMargin();
        $('#vhIpOrHostname').val(_hostname);
        $('#vhUsername').val('');
        $('#vhPassword').val('');
        $('#vhVMs').val(_vms.join(', '));
        $('#vhIpOrHostname').focus();
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
    var _siIcon = "#siIcon" + newSystemInformationsCount;
    var _siHostname = "#siHostname" + newSystemInformationsCount;
    var _siIPs = "#siIPs" + newSystemInformationsCount;
    var _siTimestamp = "#siTimestamp" + newSystemInformationsCount;
    var _siBody = "#siBody" + newSystemInformationsCount;
    var _siOS = "#siOS" + newSystemInformationsCount;
    var _siSystem = "#siSystem" + newSystemInformationsCount;
    var _siBaseboard = "#siBaseboard" + newSystemInformationsCount;
    var _siBios = "#siBios" + newSystemInformationsCount;
    var _siBmcIp = "#siBmcIp" + newSystemInformationsCount;
    var _siProcessors = "#siProcessors" + newSystemInformationsCount;
    var _siMemoryModules = "#siMemoryModules" + newSystemInformationsCount;
    var _siDisks = "#siDisks" + newSystemInformationsCount;
    var _siNics = "#siNics" + newSystemInformationsCount;
    var _siComments = "#siComments" + newSystemInformationsCount;

    var _btnApply = '#apply' + newSystemInformationsCount;
    var _btnRemove = '#remove' + newSystemInformationsCount;

    _instance = templateVM.replace(/{{}}/g, newSystemInformationsCount);
    $(containerId).append(_instance);

    this.updateInfo = function (siJson, containerId) {
        try {
            if (_containerId != containerId) {
                $(_si).detach();
                $(containerId).append(_instance);
                _containerId = containerId;
            }

            if (siJson['system'].indexOf('VMware') >= 0) {
                $(_siIcon).attr('src', 'img/VMwareVM.svg');
            }
            else {
                $(_siIcon).attr('src', 'img/server.svg');
            }

            try {
                _hostname = siJson['hostname'];
                $(_siHostname).text(_hostname);
            } catch (ignoreEx) { }

            try {
                $(_siIPs).text(siJson['ips'].replace(/\t/g, ', '));
            } catch (ignoreEx) { }

            try {
                var ts = siJson['timeStampInSecondsSinceEpochUtc'];
                if (ts < 10000000000) {
                    ts *= 1000 //seconds to ms.
                }

                ts = new Date(ts + (new Date().getTimezoneOffset() * -1)); //Utc to timezone.
                $(_siTimestamp).text('(last updated: ' + ts.toLocaleString() + ')');
            } catch (ignoreEx) { }

            try {
                $(_siOS).html('OS:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;&nbsp;' + siJson['os']);
            } catch (ignoreEx) { }
            try {
                $(_siSystem).html('System:&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;' + siJson['system']);
            } catch (ignoreEx) { }
            try {
                $(_siBaseboard).html('Baseboard:&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp;' + siJson['baseboard']);
            } catch (ignoreEx) { }
            try {
                $(_siBios).html('BIOS:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;' + siJson['bios']);
            } catch (ignoreEx) { }
            try {
                $(_siBmcIp).html('BMC IP:&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;' + siJson['bmcIp']);
            } catch (ignoreEx) { }

            try {
                $(_siProcessors).html('Processors:<ul></ul>');
                $.each(siJson['processors'].split('\t'), function (index, value) {
                    $(_siProcessors + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                $(_siMemoryModules).html('Memory modules:<ul></ul>');
                $.each(siJson['memoryModules'].split('\t'), function (index, value) {
                    $(_siMemoryModules + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                $(_siDisks).html('Disks:<ul></ul>');
                $.each(siJson['disks'].split('\t'), function (index, value) {
                    $(_siDisks + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                $(_siNics).html('NICs:<ul></ul>');
                $.each(siJson['nics'].split('\t'), function (index, value) {
                    $(_siNics + ' ul').append('<li>' + value + '</li>');
                });
            } catch (ignoreEx) { }

            try {
                if (!$(_siComments).is(':focus')) {
                    $(_siComments).val(siJson['comments']);
                }
            } catch (ignoreEx) { }

            if (!siJson['responsive']) {
                throw $(_siHostname).text() + ' > not responding';
            }
        } catch (ex) {
            $(_siHostname).text(ex);
            $(_siTimestamp).text('(last fetch attempt: ' + (new Date()).toLocaleString() + ')');
            handleError("Failed updating system information (machine reachable?). See the console for details.", ex);
        };
    };

    this.hostname = function () {
        return _hostname;
    };

    this.collapsed = function () {
        return !$(_siBody).is(':visible');
    };
    this.collapse = function () {
        $(_siBody).hide();
        $(_siToggleCollapse).attr('src', 'img/angle-right.svg');
    };
    this.uncollapse = function () {
        $(_siBody).show();
        $(_siToggleCollapse).attr('src', 'img/angle-down.svg');
    }

    $(_siToggleCollapse).click(function () {
        if ($(_siBody).is(':visible')) {
            _me.collapse();
        }
        else {
            _me.uncollapse();
        }
    });

    $(_siComments).focusin(function () {
        commentsFocus = true;
    });
    $(_siComments).focusout(function () {
        commentsFocus = false;
    });

    $(_btnApply).click(function () {
        var comments = JSON.stringify($(_siComments).val());
        $.ajax({
            url: endpoint + "/systeminformations/addorupdatecomments?apiKey=" + apiKey + "&hostname=" + _hostname,
            data: comments,
            type: 'PUT',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        });
    });

    $(_btnRemove).click(function () {
        if (confirm('Are you sure that you want to remove this?')) {
            systemInformations = jQuery.grep(systemInformations, function (value) {
                return value != _me;
            });
            $(_si).remove();

            $.ajax({
                url: endpoint + "/systeminformations/remove?apiKey=" + apiKey + "&hostname=" + _hostname,
                type: 'DELETE'
            });
        }
    });

    this.collapse();
    this.updateInfo(siJson, containerId);
};

var refresh = function () {
    if (commentsFocus) {
        return;
    }
    var error = "Failed fetching system information (API connected?).";
    //Add or update the info on the GUI.
    $.getJSON(endpoint + "/vmwarehosts/listsysteminformation?apiKey=" + apiKey, function (data) {
        $.each(data, function (i, siVHJson) {
            addOrUpdateVHSystemInformation(siVHJson);
        });
    })
        .fail(function (jqXHR, textStatus, errorThrown) {
            handleError(error, error);
        })
        .always(function () {
            $.getJSON(endpoint + "/systeminformations/list?apiKey=" + apiKey, function (data) {
                $.each(data, function (i, siJson) {
                    var hostname = siJson['hostname'];
                    var containerId = '#container';
                    $.each(vhSystemInformations, function (j, vhSI) {
                        if ($.inArray(hostname, vhSI.vms()) != -1) {
                            containerId = vhSI.vhVMContainer();
                            return false; //break
                        }
                    });
                    addOrUpdateSystemInformation(siJson, containerId);
                });
            })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    handleError(error, error);
                })
                .always(function () {
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
        if (siCandidate.hostname() == siVHJson['hostname']) {
            si = siCandidate;
            si.updateInfo(siVHJson);
            return false;
        }
    });

    if (si == null) {
        vhSystemInformations.push(new vhSystemInformation(siVHJson));
    }
};

var addEditVHost = function () {
    var vmwareHostConnectionInfo = {
        'hostname': $.trim($('#vhIpOrHostname').val()),
        'vmHostnames': $.trim($('#vhVMs').val()).replace(/ /g, '').replace(/\t/g, '').replace(/,/g, '\t'),
        'username': $.trim($('#vhUsername').val()),
        'password': $('#vhPassword').val(),
        'enabled': 1
    };
    if (!vmwareHostConnectionInfo['username'].length) {
        vmwareHostConnectionInfo['username'] = ".&DO_NOT_UPDATE_Credentials&.";
        vmwareHostConnectionInfo['password'] = "";
    }
    if (vmwareHostConnectionInfo['hostname'].length) {
        if (!vmwareHostConnectionInfo['password'].length ||
            (vmwareHostConnectionInfo['password'].length && confirm('Caution! Credentials will be send over the network. Are you sure that you want to do this?'))) {
            $('body').addClass('preloader-site');
            $('.preloader-wrapper').fadeIn();

            $.ajax({
                url: endpoint + "/vmwarehosts/addorupdate?apiKey=" + apiKey,
                data: JSON.stringify(vmwareHostConnectionInfo),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: 'POST'
            }).success(function () {
                systemInformations = [];
                vhSystemInformations = [];
                newSystemInformationsCount = 0;
                collapsed = true;
                //To make sure that comments are updated server-side
                commentsFocus = false;

                $('#container').empty();

                refresh();
            });
        }
    } else {
        alert('All fields are mandatory, except for VMs.');
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
    }
    else if (collapsedCount == systemInformations.length + vhSystemInformations.length) {
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

var setContainerTopMargin = function () {
    $('#container').css('margin-top', ($('#header').height() + 20) + 'px');
}

var handleError = function (error, fullError) {
    $('#error').show();
    $('#errorLabel').text(error);
    setContainerTopMargin();

    console.error(fullError);
}
var closeError = function () {
    $('#error').hide();
    setContainerTopMargin();
}

var addEditVHostShow = function () {
    $('#addEditVHost').show();
    setContainerTopMargin();
    $('#vhIpOrHostname').focus();
}

window.onerror = function (message, filename, linenumber) {
    handleError("Unspecified error occured. See the console for details.", message);

    return true;
}

var main = function () {
    $('body').addClass('preloader-site');
    $('.preloader-wrapper').fadeIn();

    $('#apiEndpoint').text(endpoint);

    $('#addvhost').click(function () { addEditVHostShow(); });
    $('#collapse').click(function () { collapse(); });

    $('#errorClose').click(function () { closeError(); });

    $('#vhApply').click(function () { addEditVHost(); });
    $('#vhCancel').click(function () {
        $('#addEditVHost').hide();
        setContainerTopMargin();
        $('#vhUsername').val('');
        $('#vhPassword').val('');
    });

    setTimeout(function () { refresh(); }, 1000);
    setInterval(function () { refresh(); }, 30000);
};

$(document).ready(main);