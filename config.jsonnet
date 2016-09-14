local hubClusters = [
  "hub-staging",
  "hub-eu1",
  "hub-us1",
];

local hubClusterLabels = {
  "label": "cluster",
  "options": hubClusters,
};

local hubmon = "http://hubmon.${cluster}.internal.improbable.io:9090";

local consoles = {
  component(job):: {
    "title": job,
    "selectors": [],
    "contents": [],
  },

  grpc(job):: {
    "title": job + " RPCs",
    "selectors": [
      hubClusterLabels,
      {
        "label": "service",
        "options": [],
        "queries": [
          {
            "match": {
              "cluster": ".+",
            },
            "label": "grpc_service",
            "query": "count(service_method_code:grpc_server_handled_total:rate1m{job=\"" + job + "\"}) by (grpc_service)",
            "source": hubmon + "/api/v1/query",
          },
        ],
      },
      {
        "label": "method",
        "options": [],
        "queries": [
          {
            "match": {
              "cluster": ".+",
              "service": ".+",
            },
            "label": "grpc_method",
            "query": "count(service_method_code:grpc_server_handled_total:rate1m{job=\"" + job + "\",grpc_service=\"${service}\"}) by (grpc_method)",
            "source": hubmon + "/api/v1/query",
          },
        ],
      },
    ],
    "contents": [
      {
        "graph": {
          "queries": [
            {
              "match": {
                "cluster": ".+",
              },
              "query": "job:grpc_server_handled_total:rate1m{job=\"" + job + "\"}",
              "source": hubmon + "/api/v1/query_range",
              "title": "rpcs",
              "expanded": {
                "title": "${grpc_service}",
                "query": "sum(service_method_code:grpc_server_handled_total:rate1m{job=\"" + job + "\"}) by (grpc_service)",
                "source": hubmon + "/api/v1/query_range",
                "labels": {
                  "grpc_service": "service",
                },
              },
            },
            {
              "match": {
                "cluster": ".+",
                "service": ".+",
              },
              "query": "sum(service_method_code:grpc_server_handled_total:rate1m{job=\"" + job + "\",grpc_service=\"${service}\"})",
              "source": hubmon + "/api/v1/query_range",
              "title": "rpcs",
              "expanded": {
                "title": "${grpc_method}",
                "query": "sum(service_method_code:grpc_server_handled_total:rate1m{job=\"" + job + "\",grpc_service=\"${service}\"}) by (grpc_method)",
                "source": hubmon + "/api/v1/query_range",
                "labels": {
                  "grpc_method": "method",
                },
              },
            },
            {
              "match": {
                "cluster": ".+",
                "service": ".+",
                "method": ".+",
              },
              "query": "sum(service_method_code:grpc_server_handled_total:rate1m{job=\"" + job + "\",grpc_service=\"${service}\",grpc_method=\"${method}\"}) without (grpc_code)",
              "source": hubmon + "/api/v1/query_range",
              "title": "rpcs",
            },
          ],
        },
      },
    ],
  },
};

{
  "consoles": {
    "": {
      "title": "Overview",
      "selectors": [],
      "contents": [],
    },
    "/dredd": consoles.component("dredd"),
    "/dredd/grpc": consoles.grpc("dredd"),
    "/thor": consoles.component("thor"),
    "/thor/grpc": consoles.grpc("thor"),
    "/xavier": consoles.component("xavier"),
    "/xavier/grpc": consoles.grpc("xavier"),
  }
}
