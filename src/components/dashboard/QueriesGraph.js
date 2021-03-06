/* Pi-hole: A black hole for Internet advertisements
*  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
*  Network-wide ad blocking via your own hardware.
*
*  Web Interface
*  Queries Graph component
*
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license. */

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { translate } from "react-i18next";
import { padNumber } from "../../util";
import api from "../../util/api";
import { WithAPIData } from "../common/WithAPIData";

class QueriesGraph extends Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    labels: PropTypes.array.isRequired,
    domains_over_time: PropTypes.array.isRequired,
    blocked_over_time: PropTypes.array.isRequired
  };

  render() {
    const { t } = this.props;

    const data = {
      labels: this.props.labels,
      datasets: [
        {
          label: t("Total Queries"),
          data: this.props.domains_over_time,
          fill: true,
          backgroundColor: "rgba(220,220,220,0.5)",
          borderColor: "rgba(0, 166, 90,.8)",
          pointBorderColor: "rgba(0, 166, 90,.8)",
          pointRadius: 1,
          pointHoverRadius: 5,
          pointHitRadius: 5,
          cubicInterpolationMode: "monotone"
        },
        {
          label: t("Blocked Queries"),
          data: this.props.blocked_over_time,
          fill: true,
          backgroundColor: "rgba(0,192,239,0.5)",
          borderColor: "rgba(0,192,239,1)",
          pointBorderColor: "rgba(0,192,239,1)",
          pointRadius: 1,
          pointHoverRadius: 5,
          pointHitRadius: 5,
          cubicInterpolationMode: "monotone"
        }
      ]
    };

    const options = {
      tooltips: {
        enabled: true,
        mode: "x-axis",
        callbacks: {
          title: tooltipItem => {
            const time = tooltipItem[0].xLabel.match(/(\d?\d):?(\d?\d?)/);
            const hour = parseInt(time[1], 10);
            const minute = parseInt(time[2], 10) || 0;
            const from = padNumber(hour) + ":" + padNumber(minute - 5) + ":00";
            const to = padNumber(hour) + ":" + padNumber(minute + 4) + ":59";

            return t("Queries from {{from}} to {{to}}", { from, to });
          },
          label: (tooltipItems, data) => {
            if (tooltipItems.datasetIndex === 1) {
              let percentage = 0.0;
              const total = parseInt(
                data.datasets[0].data[tooltipItems.index],
                10
              );
              const blocked = parseInt(
                data.datasets[1].data[tooltipItems.index],
                10
              );

              if (total > 0) percentage = (100.0 * blocked) / total;

              return (
                data.datasets[tooltipItems.datasetIndex].label +
                ": " +
                tooltipItems.yLabel +
                " (" +
                percentage.toFixed(1) +
                "%)"
              );
            } else
              return (
                data.datasets[tooltipItems.datasetIndex].label +
                ": " +
                tooltipItems.yLabel
              );
          }
        }
      },
      legend: { display: false },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              unit: "hour",
              displayFormats: { hour: "HH:mm" },
              tooltipFormat: "HH:mm"
            }
          }
        ],
        yAxes: [
          {
            ticks: { beginAtZero: true }
          }
        ]
      },
      maintainAspectRatio: false
    };

    return (
      <div className="card">
        <div className="card-header">{t("Queries Over Last 24 Hours")}</div>
        <div className="card-body">
          <Line width={970} height={170} data={data} options={options} />
        </div>
        {this.props.loading ? (
          <div
            className="card-img-overlay"
            style={{ background: "rgba(255,255,255,0.7)" }}
          >
            <i
              className="fa fa-refresh fa-spin"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                fontSize: "30px"
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

/**
 * Transform the API data into props for QueriesGraph
 *
 * @param data the API data
 * @returns {{loading: boolean, labels: Date[], domains_over_time: *,
 * blocked_over_time: any[]}} QueriesGraph props
 */
export const transformData = data => {
  // Remove last data point as it's not yet finished
  data = data.slice(0, -1);

  const labels = data.map(step => new Date(1000 * step.timestamp));
  const domains_over_time = data.map(step => step.total_queries);
  const blocked_over_time = data.map(step => step.blocked_queries);

  return {
    loading: false,
    labels,
    domains_over_time,
    blocked_over_time
  };
};

/**
 * The props used to show a loading state (either initial load or error)
 */
export const loadingProps = {
  loading: true,
  labels: [],
  domains_over_time: [],
  blocked_over_time: []
};

export const TranslatedQueriesGraph = translate("dashboard")(QueriesGraph);

export default props => (
  <WithAPIData
    apiCall={api.getHistoryGraph}
    repeatOptions={{
      interval: 10 * 60 * 1000
    }}
    renderInitial={() => (
      <TranslatedQueriesGraph {...loadingProps} {...props} />
    )}
    renderOk={data => (
      <TranslatedQueriesGraph {...transformData(data)} {...props} />
    )}
    renderErr={() => <TranslatedQueriesGraph {...loadingProps} {...props} />}
  />
);
