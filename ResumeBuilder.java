import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;

public class ResumeBuilder {

    static class Education {
        String degree, institution, year, grade;
    }

    static class Experience {
        String title, company, duration, description;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("=========================================");
        System.out.println("       PDF CONSOLE RESUME BUILDER        ");
        System.out.println("=========================================");

        System.out.println("\n--- Personal Information ---");
        System.out.print("Full Name: ");
        String name = scanner.nextLine();
        
        System.out.print("Email Address: ");
        String email = scanner.nextLine();
        
        System.out.print("Phone Number: ");
        String phone = scanner.nextLine();
        
        System.out.print("Address/Location: ");
        String address = scanner.nextLine();

        System.out.print("LinkedIn/Portfolio URL (Optional): ");
        String link = scanner.nextLine();

        System.out.println("\n--- Education ---");
        List<Education> educationList = new ArrayList<>();
        while (true) {
            Education edu = new Education();
            System.out.print("Degree (e.g., B.Sc Computer Science): ");
            edu.degree = scanner.nextLine();
            System.out.print("Institution: ");
            edu.institution = scanner.nextLine();
            System.out.print("Passing Year: ");
            edu.year = scanner.nextLine();
            System.out.print("Grade/CGPA: ");
            edu.grade = scanner.nextLine();
            educationList.add(edu);
            
            System.out.print("Add another education entry? (y/n): ");
            if (!scanner.nextLine().equalsIgnoreCase("y")) break;
        }

        System.out.println("\n--- Work Experience / Projects ---");
        List<Experience> experienceList = new ArrayList<>();
        while (true) {
            Experience exp = new Experience();
            System.out.print("Job Title / Project Name: ");
            exp.title = scanner.nextLine();
            System.out.print("Company / Organization (Optional): ");
            exp.company = scanner.nextLine();
            System.out.print("Duration (e.g., Jan 2020 - Dec 2022): ");
            exp.duration = scanner.nextLine();
            System.out.print("Description: ");
            exp.description = scanner.nextLine();
            experienceList.add(exp);
            
            System.out.print("Add another experience/project entry? (y/n): ");
            if (!scanner.nextLine().equalsIgnoreCase("y")) break;
        }

        System.out.println("\n--- Skills ---");
        System.out.print("Enter your skills (comma-separated): ");
        String skills = scanner.nextLine();
        
        scanner.close();

        // ------------------ PDF GENERATION ------------------
        String fileName = name.replaceAll("\\s+", "_") + "_Resume.pdf";
        if (fileName.equals("_Resume.pdf") || fileName.isEmpty()) fileName = "My_Resume.pdf";
        
        System.out.println("\nGenerating " + fileName + "...");

        try {
            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(fileName));
            document.open();

            // Fonts configuration
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.DARK_GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.DARK_GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);

            // Personal Info
            Paragraph namePara = new Paragraph(name.toUpperCase(), headerFont);
            namePara.setAlignment(Element.ALIGN_CENTER);
            namePara.setSpacingAfter(5);
            document.add(namePara);

            String contactStr = email + " | " + phone + (address.isEmpty() ? "" : " | " + address);
            Paragraph contactPara = new Paragraph(contactStr, normalFont);
            contactPara.setAlignment(Element.ALIGN_CENTER);
            document.add(contactPara);

            if (!link.isEmpty()) {
                Paragraph linkPara = new Paragraph(link, normalFont);
                linkPara.setAlignment(Element.ALIGN_CENTER);
                document.add(linkPara);
            }

            document.add(new Paragraph(" ")); // spacing

            // Separator method
            LineSeparator separator = new LineSeparator();
            separator.setPercentage(100);
            separator.setLineColor(BaseColor.GRAY);
            
            // Education Section
            if (!educationList.isEmpty()) {
                Paragraph eduTitle = new Paragraph("EDUCATION", sectionFont);
                eduTitle.setSpacingAfter(2);
                document.add(eduTitle);
                document.add(separator);
                document.add(new Paragraph(" "));
                
                for (Education edu : educationList) {
                    PdfPTable table = new PdfPTable(2);
                    table.setWidthPercentage(100);
                    table.setWidths(new float[]{3, 1}); // 75% for left, 25% for right
                    
                    PdfPCell cellLeft = new PdfPCell(new Phrase(edu.degree, subHeaderFont));
                    cellLeft.setBorder(PdfPCell.NO_BORDER);
                    table.addCell(cellLeft);
                    
                    PdfPCell cellRight = new PdfPCell(new Phrase(edu.year, smallFont));
                    cellRight.setBorder(PdfPCell.NO_BORDER);
                    cellRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    table.addCell(cellRight);
                    
                    document.add(table);
                    
                    String instDetails = edu.institution + (edu.grade.isEmpty() ? "" : " | Grade: " + edu.grade);
                    Paragraph instPara = new Paragraph(instDetails, normalFont);
                    instPara.setSpacingAfter(10);
                    document.add(instPara);
                }
            }

            // Experience Section
            if (!experienceList.isEmpty()) {
                Paragraph expTitle = new Paragraph("EXPERIENCE / PROJECTS", sectionFont);
                expTitle.setSpacingAfter(2);
                document.add(expTitle);
                document.add(separator);
                document.add(new Paragraph(" "));
                
                for (Experience exp : experienceList) {
                    PdfPTable table = new PdfPTable(2);
                    table.setWidthPercentage(100);
                    table.setWidths(new float[]{3, 1});
                    
                    PdfPCell cellLeft = new PdfPCell(new Phrase(exp.title, subHeaderFont));
                    cellLeft.setBorder(PdfPCell.NO_BORDER);
                    table.addCell(cellLeft);
                    
                    PdfPCell cellRight = new PdfPCell(new Phrase(exp.duration, smallFont));
                    cellRight.setBorder(PdfPCell.NO_BORDER);
                    cellRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    table.addCell(cellRight);
                    
                    document.add(table);
                    
                    if (!exp.company.isEmpty()) {
                        Paragraph compPara = new Paragraph(exp.company, smallFont);
                        document.add(compPara);
                    }
                    
                    Paragraph descPara = new Paragraph("- " + exp.description, normalFont);
                    descPara.setSpacingAfter(10);
                    document.add(descPara);
                }
            }

            // Skills Section
            if (!skills.isEmpty()) {
                Paragraph skillsTitle = new Paragraph("SKILLS", sectionFont);
                skillsTitle.setSpacingAfter(2);
                document.add(skillsTitle);
                document.add(separator);
                document.add(new Paragraph(" "));
                
                Paragraph skillsPara = new Paragraph(skills, normalFont);
                document.add(skillsPara);
            }

            document.close();
            System.out.println("\n✅ Resume successfully saved to: " + fileName);

        } catch (Exception e) {
            System.out.println("❌ An error occurred while generating the PDF.");
            e.printStackTrace();
        }
    }
}
