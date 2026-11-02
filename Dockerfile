
# =========================
# Build Stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy the complete solution, including referenced projects
COPY . .

# Restore dependencies
RUN dotnet restore src/SmartSchool.Api/SmartSchool.Api.csproj

# Publish API
RUN dotnet publish src/SmartSchool.Api/SmartSchool.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

# =========================
# Runtime Stage
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Cloud Run listens on port 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=build /app/publish .

# Run as non-root user
USER app

ENTRYPOINT ["dotnet", "SmartSchool.Api.dll"]
