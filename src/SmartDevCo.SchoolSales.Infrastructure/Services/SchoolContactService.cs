using Microsoft.EntityFrameworkCore;
using SmartDevCo.SchoolSales.Contracts.Common;
using SmartDevCo.SchoolSales.Contracts.DTOs;
using SmartDevCo.SchoolSales.Core.Entities;
using SmartDevCo.SchoolSales.Core.Interfaces;
using SmartDevCo.SchoolSales.Infrastructure.Data;

namespace SmartDevCo.SchoolSales.Infrastructure.Services;

public class SchoolContactService : ISchoolContactService
{
    private readonly ApplicationDbContext _db;
    private readonly IAuditService _audit;

    public SchoolContactService(ApplicationDbContext db, IAuditService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<SchoolContactDto>>> GetContactsBySchoolIdAsync(Guid schoolId)
    {
        var contacts = await _db.SchoolContacts
            .AsNoTracking()
            .Where(c => c.SchoolId == schoolId)
            .OrderByDescending(c => c.IsPrimaryContact)
            .ThenBy(c => c.FullName)
            .Select(c => new SchoolContactDto
            {
                Id = c.Id,
                SchoolId = c.SchoolId,
                FullName = c.FullName,
                JobTitle = c.JobTitle,
                Phone = c.Phone,
                Email = c.Email,
                IsDecisionMaker = c.IsDecisionMaker,
                IsPrimaryContact = c.IsPrimaryContact,
                ContactNotes = c.ContactNotes,
                CreatedAtUtc = c.CreatedAtUtc
            })
            .ToListAsync();

        return ApiResponse<List<SchoolContactDto>>.Ok(contacts);
    }

    public async Task<ApiResponse<SchoolContactDto>> AddContactAsync(Guid schoolId, CreateContactRequest request)
    {
        var school = await _db.Schools.FindAsync(schoolId);
        if (school == null)
        {
            return ApiResponse<SchoolContactDto>.Fail("School not found.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Phone))
        {
            return ApiResponse<SchoolContactDto>.Fail("Contact name and phone are required.");
        }

        // If this contact is marked primary, unmark existing primary contacts
        if (request.IsPrimaryContact)
        {
            var existingPrimary = await _db.SchoolContacts.Where(c => c.SchoolId == schoolId && c.IsPrimaryContact).ToListAsync();
            foreach (var p in existingPrimary)
            {
                p.IsPrimaryContact = false;
            }
        }

        var contact = new SchoolContact
        {
            SchoolId = schoolId,
            FullName = request.FullName.Trim(),
            JobTitle = request.JobTitle.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email?.Trim(),
            IsDecisionMaker = request.IsDecisionMaker,
            IsPrimaryContact = request.IsPrimaryContact,
            ContactNotes = request.ContactNotes?.Trim()
        };

        _db.SchoolContacts.Add(contact);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("AddContact", "SchoolContact", contact.Id.ToString(), new { contact.FullName, schoolId });

        var dto = new SchoolContactDto
        {
            Id = contact.Id,
            SchoolId = contact.SchoolId,
            FullName = contact.FullName,
            JobTitle = contact.JobTitle,
            Phone = contact.Phone,
            Email = contact.Email,
            IsDecisionMaker = contact.IsDecisionMaker,
            IsPrimaryContact = contact.IsPrimaryContact,
            ContactNotes = contact.ContactNotes,
            CreatedAtUtc = contact.CreatedAtUtc
        };

        return ApiResponse<SchoolContactDto>.Ok(dto, "Contact added successfully.");
    }

    public async Task<ApiResponse<SchoolContactDto>> UpdateContactAsync(Guid contactId, UpdateContactRequest request)
    {
        var contact = await _db.SchoolContacts.FindAsync(contactId);
        if (contact == null)
        {
            return ApiResponse<SchoolContactDto>.Fail("Contact not found.");
        }

        if (request.IsPrimaryContact && !contact.IsPrimaryContact)
        {
            var existingPrimary = await _db.SchoolContacts.Where(c => c.SchoolId == contact.SchoolId && c.Id != contactId && c.IsPrimaryContact).ToListAsync();
            foreach (var p in existingPrimary)
            {
                p.IsPrimaryContact = false;
            }
        }

        contact.FullName = request.FullName.Trim();
        contact.JobTitle = request.JobTitle.Trim();
        contact.Phone = request.Phone.Trim();
        contact.Email = request.Email?.Trim();
        contact.IsDecisionMaker = request.IsDecisionMaker;
        contact.IsPrimaryContact = request.IsPrimaryContact;
        contact.ContactNotes = request.ContactNotes?.Trim();
        contact.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var dto = new SchoolContactDto
        {
            Id = contact.Id,
            SchoolId = contact.SchoolId,
            FullName = contact.FullName,
            JobTitle = contact.JobTitle,
            Phone = contact.Phone,
            Email = contact.Email,
            IsDecisionMaker = contact.IsDecisionMaker,
            IsPrimaryContact = contact.IsPrimaryContact,
            ContactNotes = contact.ContactNotes,
            CreatedAtUtc = contact.CreatedAtUtc
        };

        return ApiResponse<SchoolContactDto>.Ok(dto, "Contact updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteContactAsync(Guid contactId)
    {
        var contact = await _db.SchoolContacts.FindAsync(contactId);
        if (contact == null)
        {
            return ApiResponse<bool>.Fail("Contact not found.");
        }

        _db.SchoolContacts.Remove(contact);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DeleteContact", "SchoolContact", contactId.ToString(), new { contact.FullName, contact.SchoolId });

        return ApiResponse<bool>.Ok(true, "Contact deleted successfully.");
    }
}
