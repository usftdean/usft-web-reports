    var reportData
    // This is only used for the example, to make sure people copy the relevant JS to be loaded/served by the JS
    // YOU MUST have the fluentReportsBrowser.min.js file served to the client to use the report engine
    if (typeof fluentReports !== "undefined") {
        hideDiv("fluentReportsError");
        showDiv("iframe");
    }

    // This is only used for the example, to make sure people copy the relevant JS to be loaded/served by the JS
    // YOU MUST have the fluentReportsBrowser.min.js file served to the client to use the report engine
    function hideDiv(id) {
        let div = document.getElementById(id)
        if (div) {
            div.style.display = "none";
        }
    }

    function showDiv(id) {
        let div = document.getElementById(id)
        if (div) {
            div.style.display = "";
        }
    }
    function updateFormAction() {
        const report = document.getElementById("report").value;
        const form = document.getElementById("reportForm");
        form.onsubmit = `startReport(${report}); return false`
    }
    function clearStuff(){
        hideDiv("fluentReportsError");
        showDiv("iframe");

    }
    async function startReport(report) {
        if (typeof fluentReports !== "undefined") {
            let requestBody = {
                    startDate: document.getElementById('startDate').value + ' 00:00:00:000',
                    endDate : document.getElementById('endDate').value + ' 23:59:59:999'
                };

            switch (report) {
                case 'ServiceAgreements':
                    await getDataFromNodeCall('POST', '/commerce/getServiceAgreementsSold', requestBody).then(function(data){
                        reportData = data
                    })
                    
                    break;
            
                default:
                    break;
            }
            printReport();
        } else {
            console.error("Fluent Reports Browser javascript wasn't loaded")
        }
    }

    // This is the function that actually generates a report...
    function printReport() {

        // These are the function that will be run to generate the report.
        var detail = function(x, r, s){
            x.band([
                {data: r.Quantity, width: 20, align: 1},
                {data: r.ProductName, width: 200},
                {data: r.Discounted, width: 150}
            ], {x: 100, border: 1, width: 0});

        };
        let titleheader = function(rpt){
            rpt.print("Service Agreements", {align: "center", fontSize: 13, fontBold: true})
            rpt.newLine()
            
        }
        let header = function(rpt){
            rpt.print("Service Agreements", {align: "center", fontSize: 13, fontBold: true})
            rpt.newLine()
            
        }

        var MonthHeader = function(x, r){
            x.newLine(2)
            x.fontBold();
            x.band([
                {data: r.Month + ", " + r.Year, width: x.maxX()-68,fontBold: true }
            ], {x: 0});
            x.fontNormal();
            x.bandLine(1);
        };
        var DayHeader = function(x, r){
            x.newline()
            x.fontBold();
            x.band([
                {data: 'Day: ' + r.Day, width: 175,fontBold: true, align: 1 }
            ], {x: 0});
            x.fontNormal();
            x.bandLine(1);
        };
        var TransactionHeader = function(x, r){
            if (r.FirstName) {
                x.band([
                    {data: r.FirstName + ' ' + r.LastName, width: 150}
                ], {x: 20});
            }
            if (r.CompanyName) {
                x.band([{data: r.CompanyName, width: 150}], {x: 20});
            }
            if (r.Address) {
                x.band([{data: r.Address, width: 150}], {x: 20});
            }
            if (r.City) {
                x.band([{data: r.City + ", " + r.State + " " + r.Zip, width: 150}], {x: 20});
            }
            x.newline();
        };
        let footer = (rpt) => {
            rpt.newLine()

            rpt.line(rpt.currentX(), rpt.maxY()-18, rpt.maxX(), rpt.maxY()-18);
            rpt.pageNumber({text: "Page {0} of {1}", footer: true, align: "right"});
            rpt.print("Printed: " + (new Date().toLocaleDateString()), {y: rpt.maxY()-14, align: "left"})
        }


        // We need a stream for the report to be generated to...
        const pipeStream = new fluentReports.BlobStream();

        // Tell the engine we are saving rendering it to a stream...
        const rpt = new fluentReports.Report(pipeStream)
            .titleheader(titleheader)
            .pageHeader(header)
            .groupBy( "Month" )
            .header(MonthHeader)
            .groupBy( "Day" )
            .header(DayHeader)
            .groupBy("ExternalTranID")
            .header(TransactionHeader)
            .data(reportData)
            .detail(detail)
            .pageFooter(footer)

        // Optional Debug output is always nice (to help you see the structure of the report in the console)
        rpt.printStructure(true);

        console.time("Rendered");

        // // This does the MAGIC...  :-)
        // rpt.render(function (err, stream) {
        //     console.timeEnd("Rendered");
        //     displayReport(err, stream);
        // });

        // You can also just do this below rather than adding the additional code above which outputs to the console how much time it took to render the report
        rpt.render(displayReport);

    }


    function displayReport(err, pipeStream) { // jshint ignore:line
        if (err) {
            console.error(err);
            alert(err);
        } else {
            const iFrame = document.getElementById('iframe');
            if (iFrame) {
                iFrame.src = pipeStream.toBlobURL('application/pdf');
            } else {
                console.error("Unable to find iFrame to show report");
                alert("Unable to find iFrame to show report");
            }
        }
    }



