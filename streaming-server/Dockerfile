FROM tiangolo/nginx-rtmp:latest

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 1935/tcp
EXPOSE 80/tcp

# Same as the base container
CMD ["nginx", "-g", "daemon off;"]