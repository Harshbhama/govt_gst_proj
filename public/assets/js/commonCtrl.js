
    $(function () {
        if ($("#invtype").val() == 'B2B') {
            $(".expp").hide();
            $(".cdn").hide();
            $(".comm").show();
        }


        $.fn.suppfun = function () {
            if ($("#supp").val() == "Intra-state") {
                $("#table").find(".intra").hide();
                $("#table").find(".inter").show();
            }
            else if ($("#supp").val() == "Inter-state") {
                $("#table").find(".inter").hide();
                $("#table").find(".intra").show();
            }
        };
        $.fn.setval = function () {
            if ($("#invtype").val() == 'SEZWP') {
                $("#table").find("input[class='form-control currency inter']").prop('disabled', true)
                $("#table").find("input[class='form-control currency inter']").val(0);
            } else {
                $("#table").find("input[class='form-control currency intra']").prop('disabled', true)
                $("#table").find("input[class='form-control currency intra']").val(0);
            }
        }
        $("#invtype").on('change', function () {
            $("#table").find("tbody tr:not(:first)").remove();
            $("#table").find("tbody tr:first").find('input,select').prop('disabled', false);
            if ($("#invtype").val() == 'B2B' || $("#invtype").val() == 'deemed' || $("#invtype").val() == 'SEZ') {
                $(".expp").hide();
                $(".b2b").show();
                $(".cdn").hide();
                $(".comm").show();
                $("#supp").val("Intra-state");
                $.fn.suppfun();
            }
            else if ($("#invtype").val() == 'EXP') {
                $(".expp").show();
                $(".b2b").hide();
                $(".cdn").hide();
                $(".comm").hide();
                $("#supp").val("Inter-state");
                $.fn.suppfun();
            }
            else if ($("#invtype").val() == 'SEZWP') {
                $(".expp").hide();
                $(".b2b").show();
                $(".cdn").hide();
                $(".comm").show();
                $("#supp").val("Intra-state");
                $.fn.setval();
                $.fn.suppfun();
            }
            else if ($("#invtype").val() == 'EXWP') {
                $(".expp").show();
                $(".b2b").hide();
                $(".cdn").hide();
                $(".comm").hide();
                $("#supp").val("Inter-state");
                $.fn.setval();
                $.fn.suppfun();
            }
            else if ($("#invtype").val() == 'cdnt' || $("#invtype").val() == 'dbnt') {
                $(".expp").hide();
                $(".b2b").hide();
                $(".cdn").show();
                $(".comm").show();
                $("#supp").val("Intra-state");
                $.fn.suppfun();
            }
        })
        if ($("#supp").val() == "Intra-state") {
            $("#table").find(".intra").hide();
            $("#table").find(".inter").show();
        }
        else if ($("#supp").val() == "Inter-state") {
            $("#table").find(".inter").hide();
            $("#table").find(".intra").show();
        }
        $("#add").click(function () {
            if ($("#supp").val() == "Intra-state") {
                var row = "<tr><td><input class='form-control' type='text'></td><td><input class='form-control' type='text'></td>" +
                    "<td><input class='form-control currency' type='number'></td><td style='width:100px;'><select class='form-control'>" +
                    "<option value=''>Select</option><option vlaue='0'>0</option><option vlaue='0.01'>0.01</option><option vlaue='0.25'>0.25</option>" +
                    "<option vlaue='0.5'>0.5</option><option vlaue='1'>1</option><option vlaue='3'>3</option><option vlaue='5'>5</option><option vlaue='12'>12</option>" +
                    "<option vlaue='18'>18</option></select></td>" +
                    "<td class='inter'><input class='form-control currency inter' type='number'></td><td class='inter'><input class='form-control currency inter' type='number'>" +
                    "</td><td><input class='form-control currency' type='number'></td><td><button title='Edit' class='btn btn-sm btn-success edit'>" +
                    "<i class='fa fa-save'></i></button><button title='Delete' type='button' class='btn btn-sm btn-danger removebutton'><i class='fa fa-trash'></i>" +
                    "</button></td></tr>";
            }
            else {
                var row = "<tr><td><input class='form-control' type='text'></td><td><input class='form-control' type='text'></td>" +
                    "<td><input class='form-control currency' type='number'></td><td style='width:100px;'><select class='form-control'>" +
                    "<option value=''>Select</option><option vlaue='0'>0</option><option vlaue='0.01'>0.01</option><option vlaue='0.25'>0.25</option>" +
                    "<option vlaue='0.5'>0.5</option><option vlaue='1'>1</option><option vlaue='3'>3</option><option vlaue='5'>5</option><option vlaue='12'>12</option>" +
                    "<option vlaue='18'>18</option></select></td><td class='intra'><input class='form-control currency intra' type='number'>" +
                    "</td><td><input class='form-control currency' type='number'></td><td><button title='Edit' class='btn btn-sm btn-success edit'>" +
                    "<i class='fa fa-save'></i></button><button title='Delete' type='button' class='btn btn-sm btn-danger removebutton'><i class='fa fa-trash'></i>" +
                    "</button></td></tr>";
            }
            $("#table tbody").append(row);
        });
        $(document).on('click', '.removebutton', function () {
            $(this).parents("tr").remove();
            $(this).closest('tr').remove();
            return false;
        });
        $(document).on('click', '.edit', function () {
            if ($(this).closest('tr').find('button i').attr('class') == 'fa fa-save') {
                $(this).closest('tr').find('input,select').prop('disabled', true);
                $(this).closest('tr').find('button.edit').removeClass('btn-success');                
                $(this).closest('tr').find('button i').removeClass('fa-save');
                $(this).closest('tr').find('button i').addClass('fa-pencil');
            } else {
                $(this).closest('tr').find('input,select').prop('disabled', false);
                $(this).closest('tr').find('button i').addClass('fa-save');
                $(this).closest('tr').find('button.edit').addClass('btn-success'); 
                $(this).closest('tr').find('button i').removeClass('fa-pencil');
            }
        })
    })

