package com.example.lab2.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ResultsBean implements Serializable {
    private List<Result> results;

    public ResultsBean() {
        this.results = new ArrayList<>();
    }

    public void addResult(Result result) {
        this.results.add(result);
    }

    public List<Result> getResults() {
        return results;
    }

    public static class Result implements Serializable {
        private String x;
        private String y;
        private String r;
        private boolean isHit;

        private long currentTimeMillis;
        private long nanoTime;



        public Result(String x, String y, String r, boolean isHit, long currentTimeMillis, long nanoTime) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.isHit = isHit;
            this.currentTimeMillis = currentTimeMillis;
            this.nanoTime = nanoTime;
        }

        public String getX() {
            return x;
        }

        public void setX(String x) {
            this.x = x;
        }

        public String getY() {
            return y;
        }

        public void setY(String y) {
            this.y = y;
        }

        public String getR() {
            return r;
        }

        public void setR(String r) {
            this.r = r;
        }

        public boolean getIsHit() {
            return isHit;
        }

        public void setIsHit(boolean hit) {
            isHit = hit;
        }

        public long getCurrentTimeMillis() {
            return currentTimeMillis;
        }

        public void setCurrentTimeMillis(long currentTimeMillis) {
            this.currentTimeMillis = currentTimeMillis;
        }

        public long getNanoTime() {
            return nanoTime;
        }

        public void setNanoTime(long nanoTime) {
            this.nanoTime = nanoTime;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Result result = (Result) o;
            return isHit == result.isHit &&
                    x.equals(result.x) &&
                    y.equals(result.y) &&
                    r.equals(result.r);
        }

        @Override
        public int hashCode() {
            return Objects.hash(x, y, r, isHit);
        }

        @Override
        public String toString() {
            return "Result{" +
                    "x='" + x + '\'' +
                    ", y='" + y + '\'' +
                    ", r='" + r + '\'' +
                    ", isHit=" + isHit +
                    '}';
        }

        public String toJson() {
            return String.format("{\"x\": \"%s\", \"y\": \"%s\", \"r\":\"%s\", \"isHit\":%s, \"curTime\": \"%d\", \"dur\": %d}", x, y, r, isHit ? "true" : "false", currentTimeMillis, nanoTime);
        }
    }

    @Override
    public String toString() {
        return "ResultsBean{" +
                "results=" + results +
                '}';
    }
}