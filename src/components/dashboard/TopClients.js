/* Pi-hole: A black hole for Internet advertisements
*  (c) 2017 Pi-hole, LLC (https://pi-hole.net)
*  Network-wide ad blocking via your own hardware.
*
*  Web Interface
*  Top Clients component
*
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license. */

import React from "react";
import { translate } from "react-i18next";
import api from "../../util/api";
import TopTable from "./TopTable";

/**
 * Transform the API data into the form used in generateRows
 *
 * @param data the API data
 * @returns {{totalQueries: number, topClients: *}} the parsed data
 */
export const transformData = data => ({
  totalQueries: data.total_queries,
  topClients: data.top_clients
});

/**
 * Create a function to generate rows of top clients
 *
 * @param t the translation function
 * @returns {function(*): any[]} a function to generate rows of top clients
 */
export const generateRows = t => data => {
  return data.topClients.map(item => {
    const percentage = (item.count / data.totalQueries) * 100;

    return (
      <tr key={item.name + "|" + item.ip}>
        <td>{item.name !== "" ? item.name : item.ip}</td>
        <td>{item.count.toLocaleString()}</td>
        <td style={{ verticalAlign: "middle" }}>
          <div
            className="progress"
            title={t("{{percent}}% of {{total}}", {
              percent: percentage.toFixed(1),
              total: data.totalQueries.toLocaleString()
            })}
          >
            <div
              className="progress-bar bg-primary"
              style={{ width: percentage + "%" }}
            />
          </div>
        </td>
      </tr>
    );
  });
};

const TopClients = ({ t, ...props }) => (
  <TopTable
    {...props}
    title={t("Top Clients")}
    initialData={{
      totalQueries: 0,
      topClients: []
    }}
    headers={[t("Client"), t("Requests"), t("Frequency")]}
    emptyMessage={t("No Clients Found")}
    isEmpty={data => data.topClients.length === 0}
    apiCall={api.getTopClients}
    apiHandler={transformData}
    generateRows={generateRows(t)}
  />
);

export default translate(["common", "dashboard"])(TopClients);
