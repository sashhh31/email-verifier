package main

import (
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type VerificationResult struct {
	Domain string `json:"domain"`
	MX     string `json:"mx"`
	SPF    string `json:"spf"`
	DMARC  string `json:"dmarc"`
	Valid  bool   `json:"valid"`
	Error  string `json:"error,omitempty"`
}

func main() {
	router := gin.Default()
	router.Use(cors.Default())
	router.GET("/verify", verifyHandler)
	log.Fatal(router.Run(":8080"))
}

func verifyHandler(c *gin.Context) {
	email := c.Query("email")

	parts := strings.Split(email, "@")

	domain := parts[1]

	result := checkDomain(domain)

	c.JSON(http.StatusOK, gin.H{"result": result})
}

func checkDomain(domain string) VerificationResult {
	mx, spf, dmarc, valid := mxRecord(domain), SPFrecord(domain), DMARCrecord(domain), false
	if mx != "Error looking up MX records" && mx != "No MX records found" && spf != "Error looking up TXT records" && spf != "No SPF record found" && dmarc != "Error looking up DMARC records" && dmarc != "No DMARC record found" {

		valid = true
	}

	return VerificationResult{
		Domain: domain,
		MX:     mx,
		SPF:    spf,
		DMARC:  dmarc,
		Valid:  valid,
	}
}

func mxRecord(domain string) string {
	mxRecords, err := net.LookupMX(domain)
	if err != nil {
		return "Error looking up MX records"
	}

	if len(mxRecords) == 0 {
		return "No MX records found"
	}

	var mxHosts []string
	for _, mx := range mxRecords {
		mxHosts = append(mxHosts, mx.Host)
	}
	return strings.Join(mxHosts, ", ")
}

func SPFrecord(domain string) string {
	txtRecords, err := net.LookupTXT(domain)
	if err != nil {
		return "Error looking up TXT records"
	}

	for _, record := range txtRecords {
		if strings.HasPrefix(record, "v=spf1") {
			return record
		}
	}
	return "No SPF record found"
}

func DMARCrecord(domain string) string {
	dmarcDomain := "_dmarc." + domain
	txtRecords, err := net.LookupTXT(dmarcDomain)
	if err != nil {
		return "Error looking up DMARC records"
	}

	for _, record := range txtRecords {
		if strings.HasPrefix(record, "v=DMARC1") {
			return record
		}
	}
	return "No DMARC record found"
}
